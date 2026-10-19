package com.electrohub.service;

import com.electrohub.dto.support.SupportTicketRequest;
import java.util.*;

public interface SupportService {
  List<Map<String,Object>> list(String userId);
  Map<String,Object> create(String userId, SupportTicketRequest request);
}
