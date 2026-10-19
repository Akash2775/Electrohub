package com.electrohub.service.impl;

import com.electrohub.dto.order.*;
import com.electrohub.repository.OrderRepository;
import com.electrohub.service.*;
import com.fasterxml.jackson.databind.JsonNode;
import java.util.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class OrderServiceImpl implements OrderService {
  private final OrderRepository repository; private final PaymentGateway gateway; private final NotificationService notifications;
  public OrderServiceImpl(OrderRepository repository,PaymentGateway gateway,NotificationService notifications){this.repository=repository;this.gateway=gateway;this.notifications=notifications;}
  @Override @Transactional public Map<String,Object> create(String user,CheckoutRequest req){gateway.ready();repository.lockUser(user);var old=repository.findByCheckoutKey(user,req.checkoutKey());if(old.isPresent())return checkoutResult(old.get());SortedMap<String,Integer> quantities=new TreeMap<>();for(var line:req.items())quantities.merge(line.productId(),line.quantity(),Integer::sum);List<Map<String,Object>> products=new ArrayList<>();long total=0;for(var e:quantities.entrySet()){var p=repository.activeProduct(e.getKey()).orElseThrow(()->new ResponseStatusException(HttpStatus.BAD_REQUEST,"A product is no longer available"));if(e.getValue()>number(p,"max_order_quantity")||number(p,"stock")<e.getValue())throw new ResponseStatusException(HttpStatus.CONFLICT,"Not enough stock for "+p.get("name"));total=Math.addExact(total,Math.multiplyExact(number(p,"price_paise"),e.getValue()));products.add(p);}if(total>1000000000L)throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Order total is too large. Contact the store.");String id=UUID.randomUUID().toString();JsonNode remote=gateway.order(total,id);String remoteId=remote.path("id").asText();if(remoteId.isBlank())throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,"Invalid payment provider response");repository.insertOrder(id,user,req.checkoutKey(),total,remoteId,req.recipient(),req.phone(),req.address(),req.pincode());for(var p:products)repository.insertOrderItem(UUID.randomUUID().toString(),id,(String)p.get("id"),(String)p.get("name"),(String)p.get("image_url"),p.get("price_paise"),quantities.get((String)p.get("id")));return checkoutResult(repository.order(id));}
  private Map<String,Object> checkoutResult(Map<String,Object> o){return Map.of("id",o.get("id"),"orderId",o.get("razorpay_order_id"),"amount",o.get("amount_paise"),"currency","INR","key",gateway.key(),"status",o.get("status"));}
  @Override public List<Map<String,Object>> list(String userId){return repository.ownedOrders(userId);}
  @Override public Map<String,Object> owned(String id,String user){var o=repository.ownedOrder(id,user).orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND,"Order not found"));o.put("items",repository.items(id));return o;}
  @Override public void verifyOwner(String local,String user,String remote){var o=owned(local,user);if(!remote.equals(o.get("razorpay_order_id")))throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Payment order does not match");}
  @Override @Transactional public String applyCaptured(JsonNode payment){String remote=payment.path("order_id").asText(),pid=payment.path("id").asText();var optional=repository.lockByRemoteOrderId(remote);if(optional.isEmpty())return "IGNORED";var order=optional.get();if(!payment.path("status").asText().equals("captured"))return (String)order.get("status");if(!payment.path("currency").asText().equals("INR")||payment.path("amount").asLong()!=number(order,"amount_paise"))throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Payment amount or currency mismatch");if(pid.isBlank())throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Missing payment ID");if(!"PENDING".equals(order.get("status")))return (String)order.get("status");var items=repository.items((String)order.get("id"));items.sort(Comparator.comparing(x->String.valueOf(x.get("product_id"))));boolean available=true;for(var item:items){var p=repository.lockProduct((String)item.get("product_id"));if(number(p,"stock")<number(item,"quantity")||!Boolean.TRUE.equals(p.get("active")))available=false;}String status=available?"PAID":"PAID_REVIEW";if(available)for(var item:items)repository.decrementStock((String)item.get("product_id"),item.get("quantity"));repository.markPayment((String)order.get("id"),status,pid);notifications.orderStatus((String)order.get("user_id"),(String)order.get("id"),status);return status;}
  private static long number(Map<String,Object> row,String key){return ((Number)row.get(key)).longValue();}
}
