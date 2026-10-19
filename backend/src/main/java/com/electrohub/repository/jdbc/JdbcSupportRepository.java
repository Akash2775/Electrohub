package com.electrohub.repository.jdbc;

import com.electrohub.repository.SupportRepository;
import java.util.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class JdbcSupportRepository implements SupportRepository {
  private final JdbcTemplate db;
  public JdbcSupportRepository(JdbcTemplate db){this.db=db;}
  @Override public List<Map<String,Object>> listByUser(String userId){ return db.queryForList("SELECT id,type,subject,message,status,created_at,updated_at FROM support_requests WHERE user_id=? ORDER BY created_at DESC",userId); }
  @Override public void insert(String id,String userId,String type,String subject,String message){ db.update("INSERT INTO support_requests(id,user_id,type,subject,message,status) VALUES(?,?,?,?,?,'OPEN')",id,userId,type,subject,message); }
  @Override public Map<String,Object> findOwned(String id,String userId){ return db.queryForMap("SELECT id,type,subject,message,status,created_at,updated_at FROM support_requests WHERE id=? AND user_id=?",id,userId); }
}
