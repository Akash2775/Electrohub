package com.electrohub.controller;

import com.electrohub.dto.review.ReviewRequest;
import com.electrohub.service.ReviewService;
import jakarta.validation.Valid;
import java.util.*;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class ReviewController {
  private final ReviewService service;
  public ReviewController(ReviewService service){this.service=service;}
  @GetMapping("/products/{productId}/reviews") List<Map<String,Object>> productReviews(@PathVariable String productId){return service.productReviews(productId);}
  @PostMapping("/products/{productId}/reviews") Map<String,Object> save(Authentication a,@PathVariable String productId,@Valid @RequestBody ReviewRequest request){return Map.of("id",service.save(a.getName(),productId,request));}
  @DeleteMapping("/reviews/{id}") void delete(Authentication a,@PathVariable String id){service.delete(a.getName(),id);}
  @GetMapping("/admin/reviews") List<Map<String,Object>> adminReviews(){return service.adminReviews();}
  @DeleteMapping("/admin/reviews/{id}") void adminDelete(@PathVariable String id){service.adminDelete(id);}
}
