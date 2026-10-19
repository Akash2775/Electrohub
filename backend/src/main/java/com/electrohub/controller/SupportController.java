package com.electrohub.controller;

import com.electrohub.dto.support.SupportTicketRequest;
import com.electrohub.service.SupportService;
import jakarta.validation.Valid;
import java.util.*;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/support")
public class SupportController {
  private final SupportService service;
  public SupportController(SupportService service){this.service=service;}
  @GetMapping List<Map<String,Object>> mine(Authentication a){return service.list(a.getName());}
  @PostMapping Map<String,Object> create(Authentication a,@Valid @RequestBody SupportTicketRequest request){return service.create(a.getName(),request);}
}
