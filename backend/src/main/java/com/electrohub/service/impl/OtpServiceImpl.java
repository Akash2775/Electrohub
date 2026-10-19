package com.electrohub.service.impl;

import com.electrohub.repository.AuthRepository;
import com.electrohub.service.*;
import com.electrohub.util.OtpFormat;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.*;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class OtpServiceImpl implements OtpService {
  private final AuthRepository repository; private final MailService mail; private final SmsOtpService sms; private final String pepper; private final int ttlMinutes; private final Map<String,Long> lastSent=new ConcurrentHashMap<>();
  public OtpServiceImpl(AuthRepository repository,MailService mail,SmsOtpService sms,@Value("${app.otp.pepper:}") String pepper,@Value("${app.otp.ttl-minutes:5}") int ttlMinutes){this.repository=repository;this.mail=mail;this.sms=sms;this.pepper=pepper;this.ttlMinutes=Math.max(2,Math.min(ttlMinutes,10));}
  @Override public void ensureRegistrationReady(){if(!mail.enabled())throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,"Email OTP is not configured yet. Add SMTP/SES credentials in backend/.env.");if(!sms.enabled())throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,"Mobile OTP is not configured yet. Add MSG91 credentials in backend/.env.");if(pepper.isBlank())throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,"OTP_PEPPER is not configured");}
  @Override public void requestLogin(String channelRaw,String destinationRaw){String channel=OtpFormat.channel(channelRaw),destination=OtpFormat.destination(channel,destinationRaw);throttle("LOGIN:"+channel+":"+destination);repository.findCustomerId(channel,destination).ifPresent(userId->createChallenge(userId,null,channel,destination,"LOGIN"));}
  @Override public String verifyLogin(String channelRaw,String destinationRaw,String code){String channel=OtpFormat.channel(channelRaw),destination=OtpFormat.destination(channel,destinationRaw);var row=findChallenge(null,channel,destination,"LOGIN");verifyChallenge(row,channel,destination,code);String userId=(String)row.get("user_id");repository.markContactVerified(userId,channel);return userId;}
  @Override public void requestRegistration(String registrationId,String channelRaw,String destinationRaw){String channel=OtpFormat.channel(channelRaw),destination=OtpFormat.destination(channel,destinationRaw);throttle("REGISTER:"+registrationId+":"+channel);createChallenge(null,registrationId,channel,destination,"REGISTER");}
  @Override public void verifyRegistration(String registrationId,String channelRaw,String destinationRaw,String code){String channel=OtpFormat.channel(channelRaw),destination=OtpFormat.destination(channel,destinationRaw);var row=findChallenge(registrationId,channel,destination,"REGISTER");verifyChallenge(row,channel,destination,code);}
  private void createChallenge(String userId,String referenceId,String channel,String destination,String purpose){String id=UUID.randomUUID().toString();Instant expires=Instant.now().plus(Duration.ofMinutes(ttlMinutes));if("EMAIL".equals(channel)){if(!mail.enabled())throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,"Email OTP is not configured yet. Add SMTP/SES credentials in backend/.env.");if(pepper.isBlank())throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,"OTP_PEPPER is not configured");String code=String.format("%06d",SecureRandomHolder.INSTANCE.nextInt(1_000_000));repository.insertEmailOtp(id,userId,referenceId,channel,destination,purpose,hash(code),java.sql.Timestamp.from(expires));String subject="REGISTER".equals(purpose)?"Verify your ElectroHub email":"Your ElectroHub login code";String action="REGISTER".equals(purpose)?"registration":"login";mail.send(destination,subject,"Your ElectroHub "+action+" OTP is "+code+". It expires in "+ttlMinutes+" minutes. Never share this code with anyone.");}else{sms.send(destination);repository.insertSmsOtp(id,userId,referenceId,channel,destination,purpose,java.sql.Timestamp.from(expires));}}
  private Map<String,Object> findChallenge(String referenceId,String channel,String destination,String purpose){return repository.findLatestOtp(referenceId,channel,destination,purpose).orElseThrow(OtpServiceImpl::failure);}
  private void verifyChallenge(Map<String,Object> row,String channel,String destination,String code){if(code==null||!code.matches("[0-9]{4,8}"))throw failure();String id=(String)row.get("id");int attempts=((Number)row.get("attempts")).intValue();java.sql.Timestamp expires=(java.sql.Timestamp)row.get("expires_at");if(attempts>=5||expires.toInstant().isBefore(Instant.now()))throw failure();repository.incrementOtpAttempts(id);boolean ok="EMAIL".equals(channel)?MessageDigest.isEqual(hash(code).getBytes(StandardCharsets.UTF_8),String.valueOf(row.get("code_hash")).getBytes(StandardCharsets.UTF_8)):sms.verify(destination,code);if(!ok)throw failure();repository.consumeOtp(id);}
  private void throttle(String key){long now=System.currentTimeMillis();Long previous=lastSent.put(key,now);if(previous!=null&&now-previous<60_000){lastSent.put(key,previous);throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS,"Wait one minute before requesting another OTP");}if(lastSent.size()>20_000)lastSent.entrySet().removeIf(e->now-e.getValue()>600_000);}
  private String hash(String code){try{Mac mac=Mac.getInstance("HmacSHA256");mac.init(new SecretKeySpec(pepper.getBytes(StandardCharsets.UTF_8),"HmacSHA256"));return HexFormat.of().formatHex(mac.doFinal(code.getBytes(StandardCharsets.UTF_8)));}catch(Exception e){throw new IllegalStateException(e);}}
  private static ResponseStatusException failure(){return new ResponseStatusException(HttpStatus.UNAUTHORIZED,"OTP is invalid or expired");}
  private static final class SecureRandomHolder{static final java.security.SecureRandom INSTANCE=new java.security.SecureRandom();}
}
