package com.electrohub.dto.auth;

import jakarta.validation.constraints.*;

public record OtpRequest(@NotBlank String channel, @NotBlank @Size(max = 254) String destination) {}
