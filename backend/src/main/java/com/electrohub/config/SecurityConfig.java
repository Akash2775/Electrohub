package com.electrohub.config;

import org.springframework.context.annotation.*;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.context.*;
import org.springframework.security.web.csrf.CsrfTokenRequestAttributeHandler;

@Configuration
public class SecurityConfig {
  @Bean PasswordEncoder passwords(){return new BCryptPasswordEncoder();}
  @Bean SecurityContextRepository contexts(){return new HttpSessionSecurityContextRepository();}
  @Bean SecurityFilterChain chain(HttpSecurity http,SecurityContextRepository contexts)throws Exception{return http.csrf(c->c.csrfTokenRequestHandler(new CsrfTokenRequestAttributeHandler()).ignoringRequestMatchers("/api/payments/webhook")).securityContext(c->c.securityContextRepository(contexts)).authorizeHttpRequests(a->a.requestMatchers(HttpMethod.GET,"/api/auth/csrf","/api/products/**","/api/categories","/api/store","/uploads/**","/images/**").permitAll().requestMatchers(HttpMethod.POST,"/api/auth/login","/api/auth/register","/api/auth/register/start","/api/auth/register/resend","/api/auth/register/verify","/api/auth/otp/request","/api/auth/otp/verify","/api/newsletter","/api/newsletter/unsubscribe","/api/payments/webhook").permitAll().requestMatchers("/api/admin/**").hasRole("ADMIN").requestMatchers("/api/orders/**","/api/payments/verify").hasRole("CUSTOMER").requestMatchers("/api/**").authenticated().anyRequest().denyAll()).exceptionHandling(e->e.authenticationEntryPoint((req,res,ex)->{res.setStatus(401);res.setContentType("application/json");res.getWriter().write("{\"message\":\"Please sign in again\"}");}).accessDeniedHandler((req,res,ex)->{res.setStatus(403);res.setContentType("application/json");res.getWriter().write("{\"message\":\"Access denied or session expired. Refresh and try again.\"}");})).logout(l->l.logoutUrl("/api/auth/logout").invalidateHttpSession(true).deleteCookies("JSESSIONID").logoutSuccessHandler((req,res,auth)->res.setStatus(204))).headers(h->h.contentTypeOptions(c->{})).build();}
}
