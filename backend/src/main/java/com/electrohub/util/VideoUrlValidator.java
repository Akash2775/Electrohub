package com.electrohub.util;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

public final class VideoUrlValidator {
  private VideoUrlValidator() {}
  public static void validate(String value) {
    if (value == null || !(value.matches("/uploads/[a-f0-9-]{36}\\.(mp4|webm)") || value.matches("https://[a-zA-Z0-9._~:/?#\\[\\]@!$&'()*+,;=%-]+")))
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Upload a valid MP4 or WebM product video first");
  }
}
