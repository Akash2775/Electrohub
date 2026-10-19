package com.electrohub.repository.jdbc;

import com.electrohub.repository.CatalogRepository;
import java.util.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class JdbcCatalogRepository implements CatalogRepository {
  private final JdbcTemplate db;
  public JdbcCatalogRepository(JdbcTemplate db){this.db=db;}
  @Override public List<Map<String,Object>> products(){ return db.queryForList("SELECT p.*,c.name category_name, COALESCE((SELECT AVG(r.rating) FROM reviews r WHERE r.product_id=p.id AND r.status='PUBLISHED'),0) average_rating, (SELECT COUNT(*) FROM reviews r WHERE r.product_id=p.id AND r.status='PUBLISHED') review_count FROM products p JOIN categories c ON c.id=p.category_id WHERE p.active=true ORDER BY p.created_at DESC,p.id"); }
  @Override public Optional<Map<String,Object>> product(String id){ var rows=db.queryForList("SELECT p.*,c.name category_name, COALESCE((SELECT AVG(r.rating) FROM reviews r WHERE r.product_id=p.id AND r.status='PUBLISHED'),0) average_rating, (SELECT COUNT(*) FROM reviews r WHERE r.product_id=p.id AND r.status='PUBLISHED') review_count FROM products p JOIN categories c ON c.id=p.category_id WHERE p.id=? AND p.active=true",id); return rows.stream().findFirst(); }
  @Override public List<Map<String,Object>> categories(){ return db.queryForList("SELECT c.*,(SELECT COUNT(*) FROM products p WHERE p.category_id=c.id AND p.active=true) product_count FROM categories c ORDER BY CASE c.name WHEN 'Smartphones' THEN 1 WHEN 'Laptops' THEN 2 WHEN 'Audio' THEN 3 WHEN 'Gaming' THEN 4 WHEN 'TVs' THEN 5 WHEN 'Wearables' THEN 6 WHEN 'Cameras' THEN 7 WHEN 'Components' THEN 8 ELSE 9 END,c.name"); }
  @Override public boolean subscriberExists(String email){ return db.queryForObject("SELECT COUNT(*) FROM subscribers WHERE email=?",Integer.class,email)>0; }
  @Override public void addSubscriber(String email){ db.update("INSERT INTO subscribers(email) VALUES(?)",email); }
  @Override public void removeSubscriber(String email){ db.update("DELETE FROM subscribers WHERE email=?",email); }
}
