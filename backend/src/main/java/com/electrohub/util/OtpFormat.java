package com.electrohub.util;

import java.util.*;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

public final class OtpFormat {
  private OtpFormat() {}
  public static String channel(String raw) {
    String value = raw == null ? "" : raw.strip().toUpperCase(Locale.ROOT);
    if (!Set.of("EMAIL", "SMS").contains(value))
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Choose email or mobile OTP");
    return value;
  }
  public static String destination(String channel, String raw) {
    String value = raw == null ? "" : raw.strip().toLowerCase(Locale.ROOT);
    if ("EMAIL".equals(channel)) {
      if (!value.matches("[^@\\s]+@[^@\\s]+\\.[^@\\s]+") || value.length() > 254)
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Enter a valid email address");
      return value;
    }
    value = value.replaceAll("[^0-9]", "");
    if (value.startsWith("91") && value.length() == 12) value = value.substring(2);
    if (!value.matches("[6-9][0-9]{9}"))
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Enter a valid 10-digit Indian mobile number");
    return value;
  }
}
