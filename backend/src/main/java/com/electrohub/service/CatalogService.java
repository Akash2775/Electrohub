package com.electrohub.service;

import java.util.*;

public interface CatalogService {
  List<Map<String,Object>> products();
  Map<String,Object> product(String id);
  List<Map<String,Object>> categories();
  Map<String,Object> store();
  String subscribe(String email);
  String unsubscribe(String email);
}
