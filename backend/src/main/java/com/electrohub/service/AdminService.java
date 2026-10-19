package com.electrohub.service;

import com.electrohub.dto.admin.*;
import java.util.*;

public interface AdminService {
  Map<String,Object> summary();
  List<Map<String,Object>> products();
  String createProduct(ProductRequest request) throws Exception;
  void updateProduct(String id, ProductRequest request) throws Exception;
  void archiveProduct(String id);
  String createCategory(CategoryRequest request);
  void updateCategory(String id, CategoryRequest request);
  void deleteCategory(String id);
  List<Map<String,Object>> orders();
  void updateOrderStatus(String id, String status);
  List<Map<String,Object>> orderItems(String id);
}
