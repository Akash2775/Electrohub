package com.electrohub.controller;

import com.electrohub.dto.auth.*;
import com.electrohub.service.AuthService;
import jakarta.servlet.http.*;
import jakarta.validation.Valid;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.*;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
  private final AuthService service; private final SecurityContextRepository contexts; private final Map<String,Attempt> attempts=new ConcurrentHashMap<>();
  record Attempt(int count,long until){}
  public AuthController(AuthService service,SecurityContextRepository contexts){this.service=service;this.contexts=contexts;}
  @GetMapping("/csrf") Map<String,String> csrf(CsrfToken token){return Map.of("token",token.getToken(),"headerName",token.getHeaderName());}
  @PostMapping("/register/start") Map<String,Object> start(@Valid @RequestBody RegisterStartRequest request,HttpServletRequest http){throttle(http);return service.startRegistration(request);}
  @PostMapping("/register/resend") Map<String,String> resend(@Valid @RequestBody RegisterResendRequest request,HttpServletRequest http){throttle(http);return Map.of("message",service.resendRegistrationOtp(request));}
  @PostMapping("/register/verify") Map<String,Object> verifyRegistration(@Valid @RequestBody RegisterVerifyRequest request,HttpServletRequest http,HttpServletResponse response){throttle(http);var result=service.verifyRegistration(request);if(Boolean.TRUE.equals(result.get("complete"))){String id=(String)result.remove("userId");String role=(String)result.remove("role");result.put("user",signIn(id,role,http,response));}return result;}
  @PostMapping("/register") void directRegistrationDisabled(){throw new ResponseStatusException(HttpStatus.GONE,"Signup now requires email and mobile OTP verification.");}
  @PostMapping("/login") Map<String,Object> login(@Valid @RequestBody LoginRequest request,HttpServletRequest http,HttpServletResponse response){throttle(http);var auth=service.authenticate(request);return signIn((String)auth.get("id"),(String)auth.get("role"),http,response);}
  @PostMapping("/otp/request") Map<String,String> requestOtp(@Valid @RequestBody OtpRequest request,HttpServletRequest http){throttle(http);return Map.of("message",service.requestOtp(request));}
  @PostMapping("/otp/verify") Map<String,Object> verifyOtp(@Valid @RequestBody OtpVerifyRequest request,HttpServletRequest http,HttpServletResponse response){throttle(http);return signIn(service.verifyOtp(request),"CUSTOMER",http,response);}
  @GetMapping("/me") Map<String,Object> me(Authentication authentication){return service.profile(authentication.getName());}
  private Map<String,Object> signIn(String id,String role,HttpServletRequest req,HttpServletResponse res){req.getSession();req.changeSessionId();var ctx=SecurityContextHolder.createEmptyContext();ctx.setAuthentication(new UsernamePasswordAuthenticationToken(id,null,List.of(new SimpleGrantedAuthority("ROLE_"+role))));SecurityContextHolder.setContext(ctx);contexts.saveContext(ctx,req,res);return service.profile(id);}
  private void throttle(HttpServletRequest request){long now=System.currentTimeMillis();if(attempts.size()>10000)attempts.entrySet().removeIf(e->e.getValue().until()<now);Attempt a=attempts.compute(request.getRemoteAddr(),(k,v)->v==null||v.until()<now?new Attempt(1,now+60000):new Attempt(v.count()+1,v.until()));if(a.count()>20)throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS,"Too many attempts. Wait one minute.");}
}
