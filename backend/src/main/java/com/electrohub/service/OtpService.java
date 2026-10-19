package com.electrohub.service;

public interface OtpService {
  void ensureRegistrationReady();
  void requestLogin(String channel, String destination);
  String verifyLogin(String channel, String destination, String code);
  void requestRegistration(String registrationId, String channel, String destination);
  void verifyRegistration(String registrationId, String channel, String destination, String code);
}
