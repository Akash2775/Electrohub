package com.electrohub.repository.jdbc;

import com.electrohub.repository.SeedRepository;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class JdbcSeedRepository implements SeedRepository {
  private final JdbcTemplate db;
  public JdbcSeedRepository(JdbcTemplate db){this.db=db;}
  @Override public boolean ownerExists(){ return db.queryForObject("SELECT COUNT(*) FROM users WHERE owner_slot=1",Integer.class)>0; }
  @Override public void createOwner(String id,String email,String passwordHash){ db.update("INSERT INTO users(id,name,email,password_hash,role,owner_slot) VALUES(?,?,?,?,?,1)",id,"Store Owner",email,passwordHash,"ADMIN"); }
  @Override public boolean hasCategories(){ return db.queryForObject("SELECT COUNT(*) FROM categories",Integer.class)>0; }
  @Override public void insertCategory(String id,String name,String imageUrl,String description){ db.update("INSERT INTO categories(id,name,image_url,description) VALUES(?,?,?,?)",id,name,imageUrl,description); }
  @Override public void insertProduct(String id,String categoryId,String name,String description,long pricePaise,long originalPricePaise,int stock,String imageUrl,String imagesJson,String badge,boolean featured,boolean deal){ db.update("INSERT INTO products(id,category_id,name,description,price_paise,original_price_paise,stock,image_url,images,badge,featured,deal) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)",id,categoryId,name,description,pricePaise,originalPricePaise,stock,imageUrl,imagesJson,badge,featured,deal); }
}
