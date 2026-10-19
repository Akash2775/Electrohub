package com.electrohub.service;

import com.electrohub.dto.auth.*;
import java.util.Map;

public interface AuthService {
  Map<String,Object> startRegistration(RegisterStartRequest request);
  String resendRegistrationOtp(RegisterResendRequest request);
  Map<String,Object> verifyRegistration(RegisterVerifyRequest request);
  Map<String,Object> authenticate(LoginRequest request);
  String requestOtp(OtpRequest request);
  String verifyOtp(OtpVerifyRequest request);
  Map<String,Object> profile(String userId);
}
