package com.electrohub.service;

import com.electrohub.dto.order.CheckoutRequest;
import com.fasterxml.jackson.databind.JsonNode;
import java.util.*;

public interface OrderService {
  Map<String,Object> create(String userId, CheckoutRequest request);
  List<Map<String,Object>> list(String userId);
  Map<String,Object> owned(String id, String userId);
  void verifyOwner(String localOrderId, String userId, String remoteOrderId);
  String applyCaptured(JsonNode payment);
}
