package com.electrohub.repository.jdbc;

import com.electrohub.dto.admin.*;
import com.electrohub.repository.AdminRepository;
import java.util.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class JdbcAdminRepository implements AdminRepository {
  private final JdbcTemplate db;
  public JdbcAdminRepository(JdbcTemplate db) { this.db = db; }

  @Override public Map<String, Object> summary() {
    return Map.of(
        "products", db.queryForObject("SELECT COUNT(*) FROM products WHERE active=true", Long.class),
        "customers", db.queryForObject("SELECT COUNT(*) FROM users WHERE role='CUSTOMER'", Long.class),
        "orders", db.queryForObject("SELECT COUNT(*) FROM orders", Long.class),
        "lowStock", db.queryForObject("SELECT COUNT(*) FROM products WHERE active=true AND stock<=low_stock_threshold", Long.class),
        "revenuePaise", db.queryForObject("SELECT COALESCE(SUM(amount_paise),0) FROM orders WHERE status IN ('PAID','PROCESSING','SHIPPED','DELIVERED','PAID_REVIEW')", Long.class));
  }
  @Override public List<Map<String,Object>> products() { return db.queryForList("SELECT p.*,c.name category_name FROM products p JOIN categories c ON p.category_id=c.id ORDER BY p.created_at DESC"); }
  @Override public boolean categoryExists(String id) { return db.queryForObject("SELECT COUNT(*) FROM categories WHERE id=?", Integer.class, id) > 0; }
  @Override public boolean skuUsedByOther(String sku, String excludeId) {
    if (excludeId == null) return db.queryForObject("SELECT COUNT(*) FROM products WHERE LOWER(sku)=LOWER(?)", Integer.class, sku) > 0;
    return db.queryForObject("SELECT COUNT(*) FROM products WHERE LOWER(sku)=LOWER(?) AND id<>?", Integer.class, sku, excludeId) > 0;
  }
  @Override public void insertProduct(String id, ProductRequest p, String imagesJson, String videosJson, String highlightsJson, String specsJson) {
    db.update("INSERT INTO products(name,description,category_id,price_paise,original_price_paise,stock,image_url,images,badge,brand,model_number,sku,color,variant_label,warranty_months,return_days,hsn_code,gst_percent,country_of_origin,shipping_weight_grams,low_stock_threshold,max_order_quantity,cod_available,installation_required,video_urls,highlights,specifications,featured,deal,active,id) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
      p.name(),p.description(),p.category_id(),p.price_paise(),p.original_price_paise(),p.stock(),p.image_url(),imagesJson,p.badge(),p.brand(),p.model_number(),p.sku(),p.color(),p.variant_label(),p.warranty_months(),p.return_days(),p.hsn_code(),p.gst_percent(),p.country_of_origin(),p.shipping_weight_grams(),p.low_stock_threshold(),p.max_order_quantity(),p.cod_available(),p.installation_required(),videosJson,highlightsJson,specsJson,p.featured(),p.deal(),p.active(),id);
  }
  @Override public boolean updateProduct(String id, ProductRequest p, String imagesJson, String videosJson, String highlightsJson, String specsJson) {
    return db.update("UPDATE products SET name=?,description=?,category_id=?,price_paise=?,original_price_paise=?,stock=?,image_url=?,images=?,badge=?,brand=?,model_number=?,sku=?,color=?,variant_label=?,warranty_months=?,return_days=?,hsn_code=?,gst_percent=?,country_of_origin=?,shipping_weight_grams=?,low_stock_threshold=?,max_order_quantity=?,cod_available=?,installation_required=?,video_urls=?,highlights=?,specifications=?,featured=?,deal=?,active=? WHERE id=?",
      p.name(),p.description(),p.category_id(),p.price_paise(),p.original_price_paise(),p.stock(),p.image_url(),imagesJson,p.badge(),p.brand(),p.model_number(),p.sku(),p.color(),p.variant_label(),p.warranty_months(),p.return_days(),p.hsn_code(),p.gst_percent(),p.country_of_origin(),p.shipping_weight_grams(),p.low_stock_threshold(),p.max_order_quantity(),p.cod_available(),p.installation_required(),videosJson,highlightsJson,specsJson,p.featured(),p.deal(),p.active(),id) > 0;
  }
  @Override public void archiveProduct(String id) { db.update("UPDATE products SET active=false WHERE id=?", id); }
  @Override public void insertCategory(String id, CategoryRequest c) { db.update("INSERT INTO categories(id,name,image_url,description) VALUES(?,?,?,?)",id,c.name(),c.image_url(),c.description()); }
  @Override public void updateCategory(String id, CategoryRequest c) { db.update("UPDATE categories SET name=?,image_url=?,description=? WHERE id=?",c.name(),c.image_url(),c.description(),id); }
  @Override public void deleteCategory(String id) { db.update("DELETE FROM categories WHERE id=?",id); }
  @Override public List<Map<String,Object>> orders() { return db.queryForList("SELECT o.*,u.email FROM orders o JOIN users u ON u.id=o.user_id ORDER BY o.created_at DESC"); }
  @Override public Optional<Map<String,Object>> lockOrderStatus(String id) { var rows=db.queryForList("SELECT status,user_id FROM orders WHERE id=? FOR UPDATE",id); return rows.stream().findFirst(); }
  @Override public void updateOrderStatus(String id,String status){ db.update("UPDATE orders SET status=? WHERE id=?",status,id); }
  @Override public List<Map<String,Object>> orderItems(String id){ return db.queryForList("SELECT * FROM order_items WHERE order_id=?",id); }
}
