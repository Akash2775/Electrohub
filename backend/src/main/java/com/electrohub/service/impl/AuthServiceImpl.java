package com.electrohub.service.impl;

import com.electrohub.dto.auth.*;
import com.electrohub.repository.AuthRepository;
import com.electrohub.service.*;
import com.electrohub.util.OtpFormat;
import java.time.*;
import java.util.*;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AuthServiceImpl implements AuthService {
  private final AuthRepository repository;
  private final PasswordEncoder encoder;
  private final OtpService otp;
  private final NotificationService notifications;
  public AuthServiceImpl(AuthRepository repository,PasswordEncoder encoder,OtpService otp,NotificationService notifications){this.repository=repository;this.encoder=encoder;this.otp=otp;this.notifications=notifications;}

  @Override public Map<String,Object> startRegistration(RegisterStartRequest r){
    otp.ensureRegistrationReady();
    String email=r.email().strip().toLowerCase(Locale.ROOT); String phone=OtpFormat.destination("SMS",r.phone()); ensureAvailable(email,phone);
    repository.deleteExpiredPendingRegistrations(); repository.deletePendingByIdentity(email,phone);
    String id=UUID.randomUUID().toString(); repository.insertPendingRegistration(id,r.name().strip(),email,phone,encoder.encode(r.password()),java.sql.Timestamp.from(Instant.now().plus(Duration.ofMinutes(15))));
    try { otp.requestRegistration(id,"EMAIL",email); otp.requestRegistration(id,"SMS",phone); }
    catch(RuntimeException e){ repository.deletePendingRegistration(id); throw e; }
    return Map.of("registrationId",id,"email",maskEmail(email),"phone",maskPhone(phone),"emailVerified",false,"phoneVerified",false,"message","We sent verification codes to your email and mobile number.");
  }
  @Override public String resendRegistrationOtp(RegisterResendRequest r){ var pending=pending(r.registrationId(),false); String channel=OtpFormat.channel(r.channel()); boolean already="EMAIL".equals(channel)?truth(pending.get("email_verified")):truth(pending.get("phone_verified")); if(already)return "This contact is already verified."; String destination=(String)pending.get("EMAIL".equals(channel)?"email":"phone"); otp.requestRegistration(r.registrationId(),channel,destination); return "A new OTP has been sent."; }
  @Override @Transactional public Map<String,Object> verifyRegistration(RegisterVerifyRequest r){
    var pending=pending(r.registrationId(),true); String channel=OtpFormat.channel(r.channel()); String destination=(String)pending.get("EMAIL".equals(channel)?"email":"phone"); boolean already="EMAIL".equals(channel)?truth(pending.get("email_verified")):truth(pending.get("phone_verified"));
    if(!already){ otp.verifyRegistration(r.registrationId(),channel,destination,r.code()); repository.markPendingVerified(r.registrationId(),channel); }
    var current=pending(r.registrationId(),true); boolean emailVerified=truth(current.get("email_verified")), phoneVerified=truth(current.get("phone_verified"));
    if(!(emailVerified&&phoneVerified)) return Map.of("complete",false,"emailVerified",emailVerified,"phoneVerified",phoneVerified,"message","OTP verified. Verify the other contact to finish signup.");
    String email=(String)current.get("email"),phone=(String)current.get("phone"); ensureAvailable(email,phone); String id=UUID.randomUUID().toString(); repository.insertCustomer(id,current.get("name"),email,phone,current.get("password_hash")); repository.deletePendingRegistration(r.registrationId());
    notifications.notifyUser(id,"WELCOME","Welcome to ElectroHub","Your email and mobile number are verified. Your ElectroHub account is ready.","/account",true);
    Map<String,Object> result=new LinkedHashMap<>(); result.put("complete",true);result.put("emailVerified",true);result.put("phoneVerified",true);result.put("userId",id);result.put("role","CUSTOMER"); return result;
  }
  @Override public Map<String,Object> authenticate(LoginRequest r){ var user=repository.findUserByEmail(r.email().strip().toLowerCase(Locale.ROOT)).orElseThrow(()->new ResponseStatusException(HttpStatus.UNAUTHORIZED,"Email or password is incorrect")); if(!encoder.matches(r.password(),(String)user.get("password_hash"))) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED,"Email or password is incorrect"); return Map.of("id",user.get("id"),"role",user.get("role")); }
  @Override public String requestOtp(OtpRequest r){ otp.requestLogin(r.channel(),r.destination()); return "If the account exists, a one-time code has been sent."; }
  @Override public String verifyOtp(OtpVerifyRequest r){ return otp.verifyLogin(r.channel(),r.destination(),r.code()); }
  @Override public Map<String,Object> profile(String userId){return repository.profile(userId);}
  private Map<String,Object> pending(String id,boolean lock){ var row=repository.findPendingRegistration(id,lock).orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND,"Signup session not found. Start signup again.")); var expires=(java.sql.Timestamp)row.get("expires_at"); if(expires.toInstant().isBefore(Instant.now())){repository.deletePendingRegistration(id);throw new ResponseStatusException(HttpStatus.GONE,"Signup OTPs expired. Start signup again.");} return row; }
  private void ensureAvailable(String email,String phone){ if(repository.userEmailExists(email))throw new ResponseStatusException(HttpStatus.CONFLICT,"An account with this email already exists"); if(repository.userPhoneExists(phone))throw new ResponseStatusException(HttpStatus.CONFLICT,"This mobile number is already in use"); }
  private static boolean truth(Object value){if(value instanceof Boolean b)return b;if(value instanceof Number n)return n.intValue()!=0;return Boolean.parseBoolean(String.valueOf(value));}
  private static String maskEmail(String email){int at=email.indexOf('@');String left=email.substring(0,at);return (left.length()<=2?left.substring(0,1)+"*":left.substring(0,2)+"***")+email.substring(at);}
  private static String maskPhone(String phone){return "+91 ******"+phone.substring(phone.length()-4);}
}
