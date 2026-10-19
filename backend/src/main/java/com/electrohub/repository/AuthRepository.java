package com.electrohub.repository;

import java.sql.Timestamp;
import java.util.*;

public interface AuthRepository {
  void deleteExpiredPendingRegistrations();
  void deletePendingByIdentity(String email, String phone);
  void insertPendingRegistration(String id, String name, String email, String phone, String passwordHash, Timestamp expiresAt);
  Optional<Map<String, Object>> findPendingRegistration(String id, boolean lock);
  void markPendingVerified(String id, String channel);
  void deletePendingRegistration(String id);
  boolean userEmailExists(String email);
  boolean userPhoneExists(String phone);
  void insertCustomer(String id, Object name, String email, String phone, Object passwordHash);
  Optional<Map<String, Object>> findUserByEmail(String email);
  Map<String, Object> profile(String id);
  Optional<String> findCustomerId(String channel, String destination);
  void markContactVerified(String userId, String channel);
  void insertEmailOtp(String id, String userId, String referenceId, String channel, String destination, String purpose, String codeHash, Timestamp expiresAt);
  void insertSmsOtp(String id, String userId, String referenceId, String channel, String destination, String purpose, Timestamp expiresAt);
  Optional<Map<String, Object>> findLatestOtp(String referenceId, String channel, String destination, String purpose);
  void incrementOtpAttempts(String id);
  void consumeOtp(String id);
}
