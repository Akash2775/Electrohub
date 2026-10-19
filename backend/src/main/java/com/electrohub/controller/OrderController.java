package com.electrohub.controller;

import com.electrohub.dto.order.*;
import com.electrohub.service.*;
import com.fasterxml.jackson.databind.*;
import jakarta.validation.Valid;
import java.util.*;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api")
public class OrderController {
  private final OrderService orders; private final PaymentGateway gateway; private final ObjectMapper json;
  public OrderController(OrderService orders,PaymentGateway gateway,ObjectMapper json){this.orders=orders;this.gateway=gateway;this.json=json;}
  @PostMapping("/orders") Map<String,Object> create(Authentication a,@Valid @RequestBody CheckoutRequest request){return orders.create(a.getName(),request);}
  @GetMapping("/orders") List<Map<String,Object>> list(Authentication a){return orders.list(a.getName());}
  @GetMapping("/orders/{id}") Map<String,Object> get(Authentication a,@PathVariable String id){return orders.owned(id,a.getName());}
  @PostMapping("/payments/verify") Map<String,Object> verify(Authentication a,@Valid @RequestBody PaymentVerifyRequest v){orders.verifyOwner(v.localOrderId(),a.getName(),v.razorpay_order_id());if(!gateway.checkoutSignature(v.razorpay_order_id(),v.razorpay_payment_id(),v.razorpay_signature()))throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Invalid payment signature");JsonNode payment=gateway.payment(v.razorpay_payment_id());if(!v.razorpay_order_id().equals(payment.path("order_id").asText()))throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Payment belongs to another order");orders.applyCaptured(payment);return orders.owned(v.localOrderId(),a.getName());}
  @PostMapping("/payments/webhook") Map<String,String> webhook(@RequestBody byte[] body,@RequestHeader(value="X-Razorpay-Signature",required=false) String signature)throws Exception{if(!gateway.webhookSignature(body,signature))throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Invalid webhook signature");JsonNode event=json.readTree(body);String name=event.path("event").asText();if(Set.of("payment.captured","order.paid").contains(name))orders.applyCaptured(event.path("payload").path("payment").path("entity"));return Map.of("status","received");}
}
