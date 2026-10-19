package com.electrohub.repository.jdbc;

import com.electrohub.repository.NotificationRepository;
import java.util.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class JdbcNotificationRepository implements NotificationRepository {
  private final JdbcTemplate db;
  public JdbcNotificationRepository(JdbcTemplate db){this.db=db;}
  @Override public void insert(String id,String userId,String type,String title,String message,String linkUrl){ db.update("INSERT INTO notifications(id,user_id,type,title,message,link_url) VALUES(?,?,?,?,?,?)",id,userId,type,title,message,linkUrl); }
  @Override public Optional<String> userEmail(String userId){ var rows=db.queryForList("SELECT email FROM users WHERE id=?",userId); return rows.stream().findFirst().map(x->(String)x.get("email")); }
  @Override public List<Map<String,Object>> list(String userId){ return db.queryForList("SELECT id,type,title,message,link_url,read_at,created_at FROM notifications WHERE user_id=? ORDER BY created_at DESC LIMIT 50",userId); }
  @Override public long unreadCount(String userId){ return db.queryForObject("SELECT COUNT(*) FROM notifications WHERE user_id=? AND read_at IS NULL",Long.class,userId); }
  @Override public void markRead(String userId,String notificationId){ db.update("UPDATE notifications SET read_at=COALESCE(read_at,CURRENT_TIMESTAMP) WHERE id=? AND user_id=?",notificationId,userId); }
  @Override public void markAllRead(String userId){ db.update("UPDATE notifications SET read_at=CURRENT_TIMESTAMP WHERE user_id=? AND read_at IS NULL",userId); }
}
