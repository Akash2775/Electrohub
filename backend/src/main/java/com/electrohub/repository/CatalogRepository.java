package com.electrohub.repository;

import java.util.*;

public interface CatalogRepository {
  List<Map<String, Object>> products();
  Optional<Map<String, Object>> product(String id);
  List<Map<String, Object>> categories();
  boolean subscriberExists(String email);
  void addSubscriber(String email);
  void removeSubscriber(String email);
}
