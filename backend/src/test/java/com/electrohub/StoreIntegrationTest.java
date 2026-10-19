package com.electrohub;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.electrohub.dto.order.CheckoutRequest;
import com.electrohub.dto.order.OrderLineRequest;
import com.electrohub.integration.payment.RazorpayGateway;
import com.electrohub.service.OrderService;
import com.electrohub.service.PaymentGateway;
import com.fasterxml.jackson.databind.*;
import java.nio.charset.StandardCharsets;
import java.util.*;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest(
    properties = {
      "spring.datasource.url=jdbc:h2:mem:store;MODE=MySQL;DATABASE_TO_LOWER=TRUE;DB_CLOSE_DELAY=-1",
      "spring.datasource.driver-class-name=org.h2.Driver",
      "spring.datasource.username=sa",
      "spring.datasource.password=",
      "app.owner.email=owner@test.example",
      "app.owner.password=OwnerTestPassword123!",
      "app.seed=false",
      "app.upload-dir=target/test-uploads"
    })
@AutoConfigureMockMvc
class StoreIntegrationTest {
  @Autowired MockMvc mvc;
  @Autowired JdbcTemplate db;
  @Autowired ObjectMapper json;
  @Autowired OrderService service;
  @Autowired PasswordEncoder passwords;
  @MockitoBean PaymentGateway gateway;

  MockHttpSession loginCustomer(String email) throws Exception {
    String id = UUID.randomUUID().toString();
    db.update(
        "INSERT INTO users(id,name,email,password_hash,role) VALUES(?,?,?,?,?)",
        id,
        "Customer",
        email,
        passwords.encode("CustomerPassword123!"),
        "CUSTOMER");
    var result =
        mvc.perform(
                post("/api/auth/login")
                    .with(csrf())
                    .contentType("application/json")
                    .content(
                        json.writeValueAsString(
                            Map.of(
                                "email", email,
                                "password", "CustomerPassword123!"))))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.role").value("CUSTOMER"))
            .andReturn();
    return (MockHttpSession) result.getRequest().getSession();
  }

  @Test
  void ownerAndCustomerRolesAreSeparated() throws Exception {
    var customer = loginCustomer(UUID.randomUUID() + "@test.example");
    mvc.perform(get("/api/admin/summary").session(customer)).andExpect(status().isForbidden());
    mvc.perform(
            post("/api/auth/login")
                .with(csrf())
                .contentType("application/json")
                .content(
                    "{\"email\":\"owner@test.example\",\"password\":\"OwnerTestPassword123!\"}"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.role").value("ADMIN"));
  }

  @Test
  void databaseAllowsOnlyOneOwner() {
    assertThrows(
        DataIntegrityViolationException.class,
        () ->
            db.update(
                "INSERT INTO users(id,name,email,password_hash,role,owner_slot) VALUES(?,?,?,?,?,?)",
                UUID.randomUUID().toString(),
                "Other",
                "other@test.example",
                "hash",
                "ADMIN",
                1));
    assertThrows(
        DataIntegrityViolationException.class,
        () ->
            db.update(
                "INSERT INTO users(id,name,email,password_hash,role) VALUES(?,?,?,?,?)",
                UUID.randomUUID().toString(),
                "Other",
                "other2@test.example",
                "hash",
                "ADMIN"));
  }

  @Test
  void csrfRequiredAndInvalidUploadsRejected() throws Exception {
    mvc.perform(post("/api/auth/login").contentType("application/json").content("{}"))
        .andExpect(status().isForbidden());
    mvc.perform(
            multipart("/api/admin/uploads")
                .file(
                    new MockMultipartFile(
                        "file", "evil.png", "image/png", "not an image".getBytes()))
                .with(user("owner").roles("ADMIN"))
                .with(csrf()))
        .andExpect(status().isBadRequest());
  }

  @Test
  void uploadPhotoAndServeIt() throws Exception {
    var image = new java.awt.image.BufferedImage(10, 10, java.awt.image.BufferedImage.TYPE_INT_RGB);
    var out = new java.io.ByteArrayOutputStream();
    javax.imageio.ImageIO.write(image, "png", out);
    var response =
        mvc.perform(
                multipart("/api/admin/uploads")
                    .file(new MockMultipartFile("file", "photo.png", "image/png", out.toByteArray()))
                    .with(user("owner").roles("ADMIN"))
                    .with(csrf()))
            .andExpect(status().isOk())
            .andReturn();
    String url = json.readTree(response.getResponse().getContentAsString()).path("url").asText();
    mvc.perform(get(url)).andExpect(status().isOk()).andExpect(content().contentType("image/png"));
  }

  @Test
  void checkoutUsesServerPriceIsIdempotentAndPaymentDecrementsStockOnce() throws Exception {
    var session = loginCustomer(UUID.randomUUID() + "@test.example");
    String uid =
        ((org.springframework.security.core.context.SecurityContext)
                session.getAttribute("SPRING_SECURITY_CONTEXT"))
            .getAuthentication()
            .getName();
    String cid = UUID.randomUUID().toString(),
        pid = UUID.randomUUID().toString(),
        rid = "order_" + UUID.randomUUID().toString().replace("-", "");
    db.update(
        "INSERT INTO categories(id,name,image_url) VALUES(?,?,?)", cid, cid, "/images/audio.jpg");
    db.update(
        "INSERT INTO products(id,category_id,name,description,price_paise,original_price_paise,stock,image_url,images) VALUES(?,?,?,?,?,?,?,?,?)",
        pid,
        cid,
        "Headphones",
        "Test",
        10000,
        12000,
        5,
        "/images/audio.jpg",
        "[]");
    when(gateway.key()).thenReturn("rzp_test_dummy");
    when(gateway.order(eq(20000L), anyString()))
        .thenReturn(json.readTree("{\"id\":\"" + rid + "\"}"));
    var request =
        new CheckoutRequest(
            "key-" + pid,
            List.of(new OrderLineRequest(pid, 2)),
            "Customer",
            "9876543210",
            "Pune complete test address",
            "411001");
    var created = service.create(uid, request);
    assertEquals(20000L, ((Number) created.get("amount")).longValue());
    assertEquals(created.get("id"), service.create(uid, request).get("id"));
    verify(gateway, times(1)).order(eq(20000L), anyString());
    mvc.perform(
            get("/api/orders/" + created.get("id")).with(user("another-user").roles("CUSTOMER")))
        .andExpect(status().isNotFound());
    var payment =
        json.readTree(
            "{\"id\":\"pay_demo\",\"order_id\":\""
                + rid
                + "\",\"status\":\"captured\",\"amount\":20000,\"currency\":\"INR\"}");
    assertThrows(
        org.springframework.web.server.ResponseStatusException.class,
        () -> service.applyCaptured(json.readTree(payment.toString().replace("INR", "USD"))));
    assertEquals(5, db.queryForObject("SELECT stock FROM products WHERE id=?", Integer.class, pid));
    assertEquals("PAID", service.applyCaptured(payment));
    assertEquals("PAID", service.applyCaptured(payment));
    assertEquals(3, db.queryForObject("SELECT stock FROM products WHERE id=?", Integer.class, pid));
  }

  @Test
  void rejectsUnsignedWebhook() throws Exception {
    when(gateway.webhookSignature(any(), any())).thenReturn(false);
    mvc.perform(
            post("/api/payments/webhook")
                .contentType("application/json")
                .content("{\"event\":\"payment.captured\"}"))
        .andExpect(status().isBadRequest());
  }

  @Test
  void hmacRejectsTamperingAndEmptySecret() throws Exception {
    byte[] body = "order_123|pay_456".getBytes(StandardCharsets.UTF_8);
    Mac mac = Mac.getInstance("HmacSHA256");
    mac.init(new SecretKeySpec("test-secret".getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
    String signature = HexFormat.of().formatHex(mac.doFinal(body));
    assertTrue(RazorpayGateway.valid("test-secret", body, signature));
    assertFalse(RazorpayGateway.valid("different", body, signature));
    assertFalse(RazorpayGateway.valid("", body, signature));
    assertFalse(RazorpayGateway.valid("test-secret", "modified".getBytes(), signature));
  }
}
