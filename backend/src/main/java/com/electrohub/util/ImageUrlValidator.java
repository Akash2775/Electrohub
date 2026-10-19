package com.electrohub.util;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

public final class ImageUrlValidator {
  private ImageUrlValidator() {}
  public static void validate(String value) {
    if (value == null || !(value.matches("/(uploads|images)/[a-zA-Z0-9._-]+\\.(jpg|jpeg|png)") || value.matches("https://[a-zA-Z0-9._~:/?#\\[\\]@!$&'()*+,;=%-]+")))
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Upload a valid JPG or PNG image first");
  }
}
