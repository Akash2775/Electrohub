package com.electrohub.repository.jdbc;

import com.electrohub.repository.OrderRepository;
import java.util.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class JdbcOrderRepository implements OrderRepository {
  private final JdbcTemplate db;
  public JdbcOrderRepository(JdbcTemplate db){this.db=db;}
  @Override public void lockUser(String userId){ db.queryForMap("SELECT id FROM users WHERE id=? FOR UPDATE",userId); }
  @Override public Optional<Map<String,Object>> findByCheckoutKey(String userId,String checkoutKey){ var rows=db.queryForList("SELECT * FROM orders WHERE user_id=? AND checkout_key=?",userId,checkoutKey); return rows.stream().findFirst(); }
  @Override public Optional<Map<String,Object>> activeProduct(String productId){ var rows=db.queryForList("SELECT * FROM products WHERE id=? AND active=true",productId); return rows.stream().findFirst(); }
  @Override public void insertOrder(String id,String userId,String checkoutKey,long amountPaise,String remoteOrderId,String recipient,String phone,String address,String pincode){ db.update("INSERT INTO orders(id,user_id,checkout_key,amount_paise,status,razorpay_order_id,recipient,phone,address,pincode) VALUES(?,?,?,?,'PENDING',?,?,?,?,?)",id,userId,checkoutKey,amountPaise,remoteOrderId,recipient,phone,address,pincode); }
  @Override public void insertOrderItem(String id,String orderId,String productId,String name,String imageUrl,Object pricePaise,int quantity){ db.update("INSERT INTO order_items(id,order_id,product_id,name,image_url,price_paise,quantity) VALUES(?,?,?,?,?,?,?)",id,orderId,productId,name,imageUrl,pricePaise,quantity); }
  @Override public Map<String,Object> order(String id){ return db.queryForMap("SELECT * FROM orders WHERE id=?",id); }
  @Override public Optional<Map<String,Object>> ownedOrder(String id,String userId){ var rows=db.queryForList("SELECT * FROM orders WHERE id=? AND user_id=?",id,userId); return rows.stream().findFirst(); }
  @Override public List<Map<String,Object>> ownedOrders(String userId){ return db.queryForList("SELECT * FROM orders WHERE user_id=? ORDER BY created_at DESC",userId); }
  @Override public List<Map<String,Object>> items(String orderId){ return db.queryForList("SELECT * FROM order_items WHERE order_id=?",orderId); }
  @Override public Optional<Map<String,Object>> lockByRemoteOrderId(String remoteOrderId){ var rows=db.queryForList("SELECT * FROM orders WHERE razorpay_order_id=? FOR UPDATE",remoteOrderId); return rows.stream().findFirst(); }
  @Override public Map<String,Object> lockProduct(String productId){ return db.queryForMap("SELECT stock,active FROM products WHERE id=? FOR UPDATE",productId); }
  @Override public void decrementStock(String productId,Object quantity){ db.update("UPDATE products SET stock=stock-? WHERE id=?",quantity,productId); }
  @Override public void markPayment(String orderId,String status,String paymentId){ db.update("UPDATE orders SET status=?,payment_id=? WHERE id=?",status,paymentId,orderId); }
}
