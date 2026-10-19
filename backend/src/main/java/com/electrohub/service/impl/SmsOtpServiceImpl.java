package com.electrohub.service.impl;

import com.electrohub.service.SmsOtpService;
import java.net.URI;
import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.server.ResponseStatusException;

@Service
public class SmsOtpServiceImpl implements SmsOtpService {
  private final RestClient http=RestClient.create(); private final boolean enabled; private final String authKey,templateId;
  public SmsOtpServiceImpl(@Value("${app.msg91.enabled:false}") boolean enabled,@Value("${app.msg91.auth-key:}") String authKey,@Value("${app.msg91.template-id:}") String templateId){this.enabled=enabled;this.authKey=authKey;this.templateId=templateId;}
  @Override public boolean enabled(){return enabled&&!authKey.isBlank()&&!templateId.isBlank();}
  @Override public void send(String phone){ready();String mobile="91"+phone;var response=http.post().uri(URI.create("https://control.msg91.com/api/v5/otp?template_id="+enc(templateId)+"&mobile="+enc(mobile)+"&authkey="+enc(authKey))).retrieve().body(Map.class);if(response==null||!"success".equalsIgnoreCase(String.valueOf(response.get("type"))))throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,"SMS OTP provider rejected the request");}
  @Override public boolean verify(String phone,String otp){ready();String mobile="91"+phone;try{var response=http.get().uri(URI.create("https://control.msg91.com/api/v5/otp/verify?otp="+enc(otp)+"&mobile="+enc(mobile)+"&authkey="+enc(authKey))).retrieve().body(Map.class);return response!=null&&"success".equalsIgnoreCase(String.valueOf(response.get("type")));}catch(Exception e){return false;}}
  private void ready(){if(!enabled())throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,"Mobile OTP is not configured yet. Add MSG91 credentials in backend/.env.");}
  private static String enc(String value){return java.net.URLEncoder.encode(value,java.nio.charset.StandardCharsets.UTF_8);}
}
