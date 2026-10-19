package com.electrohub.repository.jdbc;

import com.electrohub.repository.AuthRepository;
import java.sql.Timestamp;
import java.util.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class JdbcAuthRepository implements AuthRepository {
  private final JdbcTemplate db;
  public JdbcAuthRepository(JdbcTemplate db){ this.db=db; }
  @Override public void deleteExpiredPendingRegistrations(){ db.update("DELETE FROM pending_registrations WHERE expires_at<CURRENT_TIMESTAMP"); }
  @Override public void deletePendingByIdentity(String email,String phone){ db.update("DELETE FROM pending_registrations WHERE email=? OR phone=?",email,phone); }
  @Override public void insertPendingRegistration(String id,String name,String email,String phone,String passwordHash,Timestamp expiresAt){ db.update("INSERT INTO pending_registrations(id,name,email,phone,password_hash,expires_at) VALUES(?,?,?,?,?,?)",id,name,email,phone,passwordHash,expiresAt); }
  @Override public Optional<Map<String,Object>> findPendingRegistration(String id,boolean lock){ var rows=db.queryForList("SELECT * FROM pending_registrations WHERE id=?"+(lock?" FOR UPDATE":""),id); return rows.stream().findFirst(); }
  @Override public void markPendingVerified(String id,String channel){ db.update("UPDATE pending_registrations SET "+("EMAIL".equals(channel)?"email_verified=true":"phone_verified=true")+" WHERE id=?",id); }
  @Override public void deletePendingRegistration(String id){ db.update("DELETE FROM pending_registrations WHERE id=?",id); }
  @Override public boolean userEmailExists(String email){ return db.queryForObject("SELECT COUNT(*) FROM users WHERE email=?",Integer.class,email)>0; }
  @Override public boolean userPhoneExists(String phone){ return db.queryForObject("SELECT COUNT(*) FROM users WHERE phone=?",Integer.class,phone)>0; }
  @Override public void insertCustomer(String id,Object name,String email,String phone,Object passwordHash){ db.update("INSERT INTO users(id,name,email,phone,password_hash,role,email_verified,phone_verified) VALUES(?,?,?,?,?,'CUSTOMER',true,true)",id,name,email,phone,passwordHash); }
  @Override public Optional<Map<String,Object>> findUserByEmail(String email){ var rows=db.queryForList("SELECT * FROM users WHERE email=?",email); return rows.stream().findFirst(); }
  @Override public Map<String,Object> profile(String id){ return db.queryForMap("SELECT id,name,email,phone,email_verified,phone_verified,role FROM users WHERE id=?",id); }
  @Override public Optional<String> findCustomerId(String channel,String destination){ var rows="EMAIL".equals(channel)?db.queryForList("SELECT id FROM users WHERE email=? AND role='CUSTOMER'",destination):db.queryForList("SELECT id FROM users WHERE phone=? AND role='CUSTOMER'",destination); return rows.stream().findFirst().map(x->(String)x.get("id")); }
  @Override public void markContactVerified(String userId,String channel){ db.update("UPDATE users SET "+("EMAIL".equals(channel)?"email_verified=true":"phone_verified=true")+" WHERE id=?",userId); }
  @Override public void insertEmailOtp(String id,String userId,String referenceId,String channel,String destination,String purpose,String codeHash,Timestamp expiresAt){ db.update("INSERT INTO otp_challenges(id,user_id,reference_id,channel,destination,purpose,code_hash,expires_at) VALUES(?,?,?,?,?,?,?,?)",id,userId,referenceId,channel,destination,purpose,codeHash,expiresAt); }
  @Override public void insertSmsOtp(String id,String userId,String referenceId,String channel,String destination,String purpose,Timestamp expiresAt){ db.update("INSERT INTO otp_challenges(id,user_id,reference_id,channel,destination,purpose,expires_at) VALUES(?,?,?,?,?,?,?)",id,userId,referenceId,channel,destination,purpose,expiresAt); }
  @Override public Optional<Map<String,Object>> findLatestOtp(String referenceId,String channel,String destination,String purpose){
    List<Map<String,Object>> rows = referenceId==null
      ? db.queryForList("SELECT * FROM otp_challenges WHERE channel=? AND destination=? AND purpose=? AND consumed_at IS NULL ORDER BY created_at DESC LIMIT 1",channel,destination,purpose)
      : db.queryForList("SELECT * FROM otp_challenges WHERE reference_id=? AND channel=? AND destination=? AND purpose=? AND consumed_at IS NULL ORDER BY created_at DESC LIMIT 1",referenceId,channel,destination,purpose);
    return rows.stream().findFirst();
  }
  @Override public void incrementOtpAttempts(String id){ db.update("UPDATE otp_challenges SET attempts=attempts+1 WHERE id=?",id); }
  @Override public void consumeOtp(String id){ db.update("UPDATE otp_challenges SET consumed_at=CURRENT_TIMESTAMP WHERE id=?",id); }
}
