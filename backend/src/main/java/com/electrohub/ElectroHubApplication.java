package com.electrohub;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@EnableAsync
@SpringBootApplication(
    exclude = org.springframework.boot.autoconfigure.security.servlet.UserDetailsServiceAutoConfiguration.class)
public class ElectroHubApplication {
  public static void main(String[] args) {
    SpringApplication.run(ElectroHubApplication.class, args);
  }
}
