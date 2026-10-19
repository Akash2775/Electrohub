package com.electrohub.service;

import com.electrohub.dto.review.ReviewRequest;
import java.util.*;

public interface ReviewService {
  List<Map<String,Object>> productReviews(String productId);
  String save(String userId, String productId, ReviewRequest request);
  void delete(String userId, String id);
  List<Map<String,Object>> adminReviews();
  void adminDelete(String id);
}
