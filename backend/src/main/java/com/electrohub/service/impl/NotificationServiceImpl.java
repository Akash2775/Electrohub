package com.electrohub.service.impl;

import com.electrohub.repository.NotificationRepository;
import com.electrohub.service.*;
import java.util.*;
import org.springframework.stereotype.Service;

@Service
public class NotificationServiceImpl implements NotificationService {
  private final NotificationRepository repository; private final MailService mail;
  public NotificationServiceImpl(NotificationRepository repository,MailService mail){this.repository=repository;this.mail=mail;}
  @Override public void notifyUser(String userId,String type,String title,String message,String linkUrl,boolean email){repository.insert(UUID.randomUUID().toString(),userId,type,title,message,linkUrl);if(email)repository.userEmail(userId).ifPresent(address->mail.send(address,"ElectroHub · "+title,message+"\n\nOpen ElectroHub to view your order details."));}
  @Override public void orderStatus(String userId,String orderId,String status){String shortId=orderId.length()>8?orderId.substring(0,8):orderId;String title,message;switch(status){case "PAID"->{title="Payment received";message="Payment for order #"+shortId+" was received successfully.";}case "PAID_REVIEW"->{title="Payment received · order needs review";message="Payment for order #"+shortId+" was received. The store is checking product availability.";}case "PROCESSING"->{title="Order is being prepared";message="Order #"+shortId+" is now being prepared for dispatch.";}case "SHIPPED"->{title="Order shipped";message="Good news — order #"+shortId+" has been shipped.";}case "DELIVERED"->{title="Order delivered";message="Order #"+shortId+" has been marked delivered. You can now review purchased products.";}default->{title="Order update";message="Order #"+shortId+" status changed to "+status.toLowerCase(Locale.ROOT)+".";}} notifyUser(userId,"ORDER_"+status,title,message,"/account/orders/"+orderId,true);}
  @Override public List<Map<String,Object>> list(String userId){return repository.list(userId);}
  @Override public long unreadCount(String userId){return repository.unreadCount(userId);}
  @Override public void markRead(String userId,String notificationId){repository.markRead(userId,notificationId);}
  @Override public void markAllRead(String userId){repository.markAllRead(userId);}
}
