package com.electrohub.service.impl;

import com.electrohub.service.MailService;
import org.slf4j.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class MailServiceImpl implements MailService {
  private static final Logger log=LoggerFactory.getLogger(MailServiceImpl.class); private final JavaMailSender mail; private final boolean enabled; private final String from;
  public MailServiceImpl(JavaMailSender mail,@Value("${app.mail.enabled:false}") boolean enabled,@Value("${app.mail.from:}") String from){this.mail=mail;this.enabled=enabled;this.from=from;}
  @Override public boolean enabled(){return enabled&&!from.isBlank();}
  @Override @Async public void send(String to,String subject,String body){if(!enabled())return;try{SimpleMailMessage m=new SimpleMailMessage();m.setFrom(from);m.setTo(to);m.setSubject(subject);m.setText(body);mail.send(m);}catch(Exception e){log.error("Transactional email failed for {}: {}",to,e.getMessage());}}
}
