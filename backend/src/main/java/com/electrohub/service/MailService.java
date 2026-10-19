package com.electrohub.service;

public interface MailService {
  boolean enabled();
  void send(String to, String subject, String body);
}
