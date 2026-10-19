package com.electrohub.service.impl;

import com.electrohub.dto.admin.*;
import com.electrohub.model.OrderStatus;
import com.electrohub.repository.AdminRepository;
import com.electrohub.service.*;
import com.electrohub.util.ImageUrlValidator;
import com.electrohub.util.VideoUrlValidator;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AdminServiceImpl implements AdminService {
  private final AdminRepository repository;
  private final ObjectMapper json;
  private final NotificationService notifications;
  public AdminServiceImpl(AdminRepository repository,ObjectMapper json,NotificationService notifications){this.repository=repository;this.json=json;this.notifications=notifications;}
  @Override public Map<String,Object> summary(){return repository.summary();}
  @Override public List<Map<String,Object>> products(){return repository.products();}
  @Override public String createProduct(ProductRequest p) throws Exception {
    validateProduct(p,null);
    String id=UUID.randomUUID().toString();
    repository.insertProduct(id,p,json.writeValueAsString(p.images()),json.writeValueAsString(p.video_urls()),json.writeValueAsString(cleanHighlights(p.highlights())),json.writeValueAsString(cleanSpecs(p.specifications())));
    return id;
  }
  @Override public void updateProduct(String id,ProductRequest p) throws Exception {
    validateProduct(p,id);
    if(!repository.updateProduct(id,p,json.writeValueAsString(p.images()),json.writeValueAsString(p.video_urls()),json.writeValueAsString(cleanHighlights(p.highlights())),json.writeValueAsString(cleanSpecs(p.specifications()))))
      throw new ResponseStatusException(HttpStatus.NOT_FOUND,"Product not found");
  }
  private List<String> cleanHighlights(List<String> values){return values.stream().map(String::strip).filter(v->!v.isBlank()).distinct().toList();}
  private Map<String,String> cleanSpecs(Map<String,String> values){
    Map<String,String> cleaned=new LinkedHashMap<>();
    values.forEach((k,v)->{if(k!=null&&v!=null&&!k.isBlank()&&!v.isBlank())cleaned.put(k.strip(),v.strip());});
    return cleaned;
  }
  private void validateProduct(ProductRequest p,String excludeId){
    ImageUrlValidator.validate(p.image_url());
    p.images().forEach(ImageUrlValidator::validate);
    p.video_urls().forEach(VideoUrlValidator::validate);
    if(p.original_price_paise()!=0 && p.original_price_paise()<p.price_paise()) throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Original price cannot be below selling price");
    if(!repository.categoryExists(p.category_id())) throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Choose a valid category");
    if(repository.skuUsedByOther(p.sku().strip(),excludeId)) throw new ResponseStatusException(HttpStatus.CONFLICT,"SKU is already used by another product");
    if(p.low_stock_threshold()>p.stock() && p.stock()>0) { /* valid: it simply marks this item low-stock */ }
  }
  @Override public void archiveProduct(String id){repository.archiveProduct(id);}
  @Override public String createCategory(CategoryRequest c){ImageUrlValidator.validate(c.image_url());String id=UUID.randomUUID().toString();repository.insertCategory(id,c);return id;}
  @Override public void updateCategory(String id,CategoryRequest c){ImageUrlValidator.validate(c.image_url());repository.updateCategory(id,c);}
  @Override public void deleteCategory(String id){repository.deleteCategory(id);}
  @Override public List<Map<String,Object>> orders(){return repository.orders();}
  @Override @Transactional public void updateOrderStatus(String id,String requested){
    var row=repository.lockOrderStatus(id).orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND,"Order not found"));
    OrderStatus old;
    OrderStatus next;
    try { old=OrderStatus.valueOf((String)row.get("status")); next=OrderStatus.valueOf(requested); }
    catch(IllegalArgumentException e){throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Invalid order status");}
    if(old.nextFulfilmentStatus().filter(next::equals).isEmpty()) throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Invalid order status transition");
    repository.updateOrderStatus(id,next.name());
    notifications.orderStatus((String)row.get("user_id"),id,next.name());
  }
  @Override public List<Map<String,Object>> orderItems(String id){return repository.orderItems(id);}
}
