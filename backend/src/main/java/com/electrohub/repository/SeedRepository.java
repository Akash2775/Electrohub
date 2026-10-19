package com.electrohub.repository;

public interface SeedRepository {
  boolean ownerExists();
  void createOwner(String id, String email, String passwordHash);
  boolean hasCategories();
  void insertCategory(String id, String name, String imageUrl, String description);
  void insertProduct(String id, String categoryId, String name, String description, long pricePaise, long originalPricePaise, int stock, String imageUrl, String imagesJson, String badge, boolean featured, boolean deal);
}
