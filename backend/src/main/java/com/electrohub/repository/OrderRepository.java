package com.electrohub.repository;

import java.util.*;

public interface OrderRepository {
  void lockUser(String userId);
  Optional<Map<String, Object>> findByCheckoutKey(String userId, String checkoutKey);
  Optional<Map<String, Object>> activeProduct(String productId);
  void insertOrder(String id, String userId, String checkoutKey, long amountPaise, String remoteOrderId, String recipient, String phone, String address, String pincode);
  void insertOrderItem(String id, String orderId, String productId, String name, String imageUrl, Object pricePaise, int quantity);
  Map<String, Object> order(String id);
  Optional<Map<String, Object>> ownedOrder(String id, String userId);
  List<Map<String, Object>> ownedOrders(String userId);
  List<Map<String, Object>> items(String orderId);
  Optional<Map<String, Object>> lockByRemoteOrderId(String remoteOrderId);
  Map<String, Object> lockProduct(String productId);
  void decrementStock(String productId, Object quantity);
  void markPayment(String orderId, String status, String paymentId);
}
