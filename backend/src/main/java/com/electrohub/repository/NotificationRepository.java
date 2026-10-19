package com.electrohub.repository;

import java.util.*;

public interface NotificationRepository {
  void insert(String id, String userId, String type, String title, String message, String linkUrl);
  Optional<String> userEmail(String userId);
  List<Map<String, Object>> list(String userId);
  long unreadCount(String userId);
  void markRead(String userId, String notificationId);
  void markAllRead(String userId);
}
