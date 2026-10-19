package com.electrohub.repository;

import java.util.*;

public interface SupportRepository {
  List<Map<String, Object>> listByUser(String userId);
  void insert(String id, String userId, String type, String subject, String message);
  Map<String, Object> findOwned(String id, String userId);
}
