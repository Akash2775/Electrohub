package com.electrohub.integration.payment;

import com.electrohub.service.PaymentGateway;
import com.fasterxml.jackson.databind.*;
import java.net.URI;
import java.net.http.*;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Duration;
import java.util.*;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class RazorpayGateway implements PaymentGateway {
  private final String key,secret,webhook; private final ObjectMapper json; private final HttpClient client=HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(10)).build();
  public RazorpayGateway(@Value("${app.razorpay.key-id}") String key,@Value("${app.razorpay.key-secret}") String secret,@Value("${app.razorpay.webhook-secret}") String webhook,ObjectMapper json){this.key=key;this.secret=secret;this.webhook=webhook;this.json=json;}
  @Override public String key(){return key;}
  @Override public void ready(){if(key.isBlank()||secret.isBlank())throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,"Payments are not configured yet. Please contact the store owner.");}
  @Override public JsonNode order(long amount,String receipt){return request("orders",Map.of("amount",amount,"currency","INR","receipt",receipt));}
  @Override public JsonNode payment(String id){if(!id.matches("pay_[A-Za-z0-9]+"))throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Invalid payment ID");return request("payments/"+id,null);}
  private JsonNode request(String path,Object body){ready();try{var b=HttpRequest.newBuilder(URI.create("https://api.razorpay.com/v1/"+path)).timeout(Duration.ofSeconds(20)).header("Authorization","Basic "+Base64.getEncoder().encodeToString((key+":"+secret).getBytes(StandardCharsets.UTF_8))).header("Content-Type","application/json");if(body!=null)b.POST(HttpRequest.BodyPublishers.ofString(json.writeValueAsString(body)));else b.GET();var r=client.send(b.build(),HttpResponse.BodyHandlers.ofString());if(r.statusCode()<200||r.statusCode()>=300)throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,"Payment provider rejected the request. Check Razorpay configuration or retry later.");return json.readTree(r.body());}catch(ResponseStatusException e){throw e;}catch(Exception e){if(e instanceof InterruptedException)Thread.currentThread().interrupt();throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,"Payment provider unavailable. Retry shortly.");}}
  @Override public boolean checkoutSignature(String order,String payment,String signature){return valid(secret,(order+"|"+payment).getBytes(StandardCharsets.UTF_8),signature);}
  @Override public boolean webhookSignature(byte[] body,String signature){return valid(webhook,body,signature);}
  public static boolean valid(String secret,byte[] data,String signature){if(secret==null||secret.isBlank()||signature==null||!signature.matches("[a-fA-F0-9]{64}"))return false;try{Mac mac=Mac.getInstance("HmacSHA256");mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8),"HmacSHA256"));return MessageDigest.isEqual(mac.doFinal(data),HexFormat.of().parseHex(signature));}catch(Exception e){return false;}}
}
