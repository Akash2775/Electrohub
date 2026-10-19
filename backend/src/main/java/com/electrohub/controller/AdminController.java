package com.electrohub.controller;

import com.electrohub.dto.admin.*;
import com.electrohub.service.AdminService;
import jakarta.validation.Valid;
import java.util.*;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
public class AdminController {
  private final AdminService service;
  public AdminController(AdminService service){this.service=service;}
  @GetMapping("/summary") Map<String,Object> summary(){return service.summary();}
  @GetMapping("/products") List<Map<String,Object>> products(){return service.products();}
  @PostMapping("/products") Map<String,String> create(@Valid @RequestBody ProductRequest request)throws Exception{return Map.of("id",service.createProduct(request));}
  @PutMapping("/products/{id}") Map<String,String> update(@PathVariable String id,@Valid @RequestBody ProductRequest request)throws Exception{service.updateProduct(id,request);return Map.of("id",id);}
  @DeleteMapping("/products/{id}") void archive(@PathVariable String id){service.archiveProduct(id);}
  @PostMapping("/categories") Map<String,String> category(@Valid @RequestBody CategoryRequest request){return Map.of("id",service.createCategory(request));}
  @PutMapping("/categories/{id}") void editCategory(@PathVariable String id,@Valid @RequestBody CategoryRequest request){service.updateCategory(id,request);}
  @DeleteMapping("/categories/{id}") void deleteCategory(@PathVariable String id){service.deleteCategory(id);}
  @GetMapping("/orders") List<Map<String,Object>> orders(){return service.orders();}
  @PatchMapping("/orders/{id}") void status(@PathVariable String id,@Valid @RequestBody OrderStatusRequest request){service.updateOrderStatus(id,request.status());}
  @GetMapping("/orders/{id}/items") List<Map<String,Object>> items(@PathVariable String id){return service.orderItems(id);}
}
