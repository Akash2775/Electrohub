package com.electrohub.service.impl;

import com.electrohub.repository.CatalogRepository;
import com.electrohub.service.CatalogService;
import java.util.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class CatalogServiceImpl implements CatalogService {
  private final CatalogRepository repository;
  public CatalogServiceImpl(CatalogRepository repository){this.repository=repository;}
  @Override public List<Map<String,Object>> products(){return repository.products();}
  @Override public Map<String,Object> product(String id){return repository.product(id).orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND,"Product not found"));}
  @Override public List<Map<String,Object>> categories(){return repository.categories();}
  @Override public Map<String,Object> store(){return Map.of("name","ElectroHub","location","Pune, Maharashtra","currency","INR","shippingPaise",0);}
  @Override public String subscribe(String emailRaw){String email=emailRaw.toLowerCase(Locale.ROOT).strip();if(!repository.subscriberExists(email))repository.addSubscriber(email);return "Subscription saved. You can unsubscribe using the same email.";}
  @Override public String unsubscribe(String emailRaw){repository.removeSubscriber(emailRaw.strip().toLowerCase(Locale.ROOT));return "Unsubscribed";}
}
