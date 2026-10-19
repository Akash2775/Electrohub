package com.electrohub.repository;

import com.electrohub.dto.admin.CategoryRequest;
import com.electrohub.dto.admin.ProductRequest;
import java.util.*;

public interface AdminRepository {
  Map<String, Object> summary();
  List<Map<String, Object>> products();
  boolean categoryExists(String id);
  boolean skuUsedByOther(String sku, String excludeId);
  void insertProduct(String id, ProductRequest product, String imagesJson, String videosJson, String highlightsJson, String specsJson);
  boolean updateProduct(String id, ProductRequest product, String imagesJson, String videosJson, String highlightsJson, String specsJson);
  void archiveProduct(String id);
  void insertCategory(String id, CategoryRequest category);
  void updateCategory(String id, CategoryRequest category);
  void deleteCategory(String id);
  List<Map<String, Object>> orders();
  Optional<Map<String, Object>> lockOrderStatus(String id);
  void updateOrderStatus(String id, String status);
  List<Map<String, Object>> orderItems(String id);
}
