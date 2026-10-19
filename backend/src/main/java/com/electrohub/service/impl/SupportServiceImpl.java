package com.electrohub.service.impl;

import com.electrohub.dto.support.SupportTicketRequest;
import com.electrohub.repository.SupportRepository;
import com.electrohub.service.*;
import java.util.*;
import org.springframework.stereotype.Service;

@Service
public class SupportServiceImpl implements SupportService {
  private final SupportRepository repository; private final NotificationService notifications;
  public SupportServiceImpl(SupportRepository repository,NotificationService notifications){this.repository=repository;this.notifications=notifications;}
  @Override public List<Map<String,Object>> list(String userId){return repository.listByUser(userId);}
  @Override public Map<String,Object> create(String userId,SupportTicketRequest request){String id=UUID.randomUUID().toString();repository.insert(id,userId,request.type().name(),request.subject().strip(),request.message().strip());notifications.notifyUser(userId,"SUPPORT","Customer care ticket received","Your support ticket #"+id.substring(0,8)+" has been received.","/account?tab=support",false);return repository.findOwned(id,userId);}
}
