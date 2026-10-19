package com.electrohub.repository.jdbc;

import com.electrohub.repository.ReviewRepository;
import java.util.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class JdbcReviewRepository implements ReviewRepository {
  private final JdbcTemplate db;
  public JdbcReviewRepository(JdbcTemplate db){this.db=db;}
  @Override public List<Map<String,Object>> productReviews(String productId){ return db.queryForList("SELECT r.id,r.rating,r.title,r.body,r.created_at,r.updated_at,u.name reviewer_name,true verified_purchase FROM reviews r JOIN users u ON u.id=r.user_id WHERE r.product_id=? AND r.status='PUBLISHED' ORDER BY r.created_at DESC",productId); }
  @Override public Optional<String> latestDeliveredOrder(String userId,String productId){ var rows=db.queryForList("SELECT o.id FROM orders o JOIN order_items i ON i.order_id=o.id WHERE o.user_id=? AND i.product_id=? AND o.status='DELIVERED' ORDER BY o.created_at DESC LIMIT 1",userId,productId); return rows.stream().findFirst().map(x->(String)x.get("id")); }
  @Override public Optional<String> existingReview(String userId,String productId){ var rows=db.queryForList("SELECT id FROM reviews WHERE user_id=? AND product_id=?",userId,productId); return rows.stream().findFirst().map(x->(String)x.get("id")); }
  @Override public void insert(String id,String productId,String userId,String orderId,int rating,String title,String body){ db.update("INSERT INTO reviews(id,product_id,user_id,order_id,rating,title,body) VALUES(?,?,?,?,?,?,?)",id,productId,userId,orderId,rating,title,body); }
  @Override public void update(String id,String userId,int rating,String title,String body){ db.update("UPDATE reviews SET rating=?,title=?,body=?,status='PUBLISHED',updated_at=CURRENT_TIMESTAMP WHERE id=? AND user_id=?",rating,title,body,id,userId); }
  @Override public boolean deleteOwned(String id,String userId){ return db.update("DELETE FROM reviews WHERE id=? AND user_id=?",id,userId)>0; }
  @Override public List<Map<String,Object>> adminReviews(){ return db.queryForList("SELECT r.*,u.name reviewer_name,u.email,p.name product_name FROM reviews r JOIN users u ON u.id=r.user_id JOIN products p ON p.id=r.product_id ORDER BY r.created_at DESC"); }
  @Override public void adminDelete(String id){ db.update("DELETE FROM reviews WHERE id=?",id); }
}
