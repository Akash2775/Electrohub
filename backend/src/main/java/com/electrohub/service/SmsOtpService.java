package com.electrohub.service;

public interface SmsOtpService {
  boolean enabled();
  void send(String tenDigitPhone);
  boolean verify(String tenDigitPhone, String otp);
}
