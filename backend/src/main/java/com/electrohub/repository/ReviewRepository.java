package com.electrohub.repository;

import java.util.*;

public interface ReviewRepository {
  List<Map<String, Object>> productReviews(String productId);
  Optional<String> latestDeliveredOrder(String userId, String productId);
  Optional<String> existingReview(String userId, String productId);
  void insert(String id, String productId, String userId, String orderId, int rating, String title, String body);
  void update(String id, String userId, int rating, String title, String body);
  boolean deleteOwned(String id, String userId);
  List<Map<String, Object>> adminReviews();
  void adminDelete(String id);
}
