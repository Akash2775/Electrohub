package com.electrohub.controller;

import com.electrohub.dto.catalog.SubscriptionRequest;
import com.electrohub.service.CatalogService;
import jakarta.validation.Valid;
import java.util.*;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class CatalogController {
  private final CatalogService service;
  public CatalogController(CatalogService service){this.service=service;}
  @GetMapping("/products") List<Map<String,Object>> products(){return service.products();}
  @GetMapping("/products/{id}") Map<String,Object> product(@PathVariable String id){return service.product(id);}
  @GetMapping("/categories") List<Map<String,Object>> categories(){return service.categories();}
  @GetMapping("/store") Map<String,Object> store(){return service.store();}
  @PostMapping("/newsletter") Map<String,String> subscribe(@Valid @RequestBody SubscriptionRequest request){return Map.of("message",service.subscribe(request.email()));}
  @PostMapping("/newsletter/unsubscribe") Map<String,String> unsubscribe(@Valid @RequestBody SubscriptionRequest request){return Map.of("message",service.unsubscribe(request.email()));}
}
