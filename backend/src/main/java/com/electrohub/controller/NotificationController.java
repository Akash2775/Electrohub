package com.electrohub.controller;

import com.electrohub.service.NotificationService;
import java.util.*;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {
  private final NotificationService service;
  public NotificationController(NotificationService service){this.service=service;}
  @GetMapping List<Map<String,Object>> list(Authentication a){return service.list(a.getName());}
  @GetMapping("/unread-count") Map<String,Object> unread(Authentication a){return Map.of("count",service.unreadCount(a.getName()));}
  @PatchMapping("/{id}/read") void read(Authentication a,@PathVariable String id){service.markRead(a.getName(),id);}
  @PatchMapping("/read-all") void readAll(Authentication a){service.markAllRead(a.getName());}
}
