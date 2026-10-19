package com.electrohub.service.impl;

import com.electrohub.dto.review.ReviewRequest;
import com.electrohub.repository.ReviewRepository;
import com.electrohub.service.ReviewService;
import java.util.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class ReviewServiceImpl implements ReviewService {
  private final ReviewRepository repository;
  public ReviewServiceImpl(ReviewRepository repository){this.repository=repository;}
  @Override public List<Map<String,Object>> productReviews(String productId){return repository.productReviews(productId);}
  @Override public String save(String userId,String productId,ReviewRequest input){String orderId=repository.latestDeliveredOrder(userId,productId).orElseThrow(()->new ResponseStatusException(HttpStatus.FORBIDDEN,"Only customers with a delivered purchase can review this product"));var existing=repository.existingReview(userId,productId);if(existing.isEmpty()){String id=UUID.randomUUID().toString();repository.insert(id,productId,userId,orderId,input.rating(),input.title().strip(),input.body().strip());return id;}String id=existing.get();repository.update(id,userId,input.rating(),input.title().strip(),input.body().strip());return id;}
  @Override public void delete(String userId,String id){if(!repository.deleteOwned(id,userId))throw new ResponseStatusException(HttpStatus.NOT_FOUND,"Review not found");}
  @Override public List<Map<String,Object>> adminReviews(){return repository.adminReviews();}
  @Override public void adminDelete(String id){repository.adminDelete(id);}
}
