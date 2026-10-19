package com.electrohub.service;

import java.util.*;

public interface NotificationService {
  void notifyUser(String userId, String type, String title, String message, String linkUrl, boolean email);
  void orderStatus(String userId, String orderId, String status);
  List<Map<String,Object>> list(String userId);
  long unreadCount(String userId);
  void markRead(String userId, String notificationId);
  void markAllRead(String userId);
}
