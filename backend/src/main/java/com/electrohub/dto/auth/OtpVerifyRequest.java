package com.electrohub.dto.auth;

import jakarta.validation.constraints.*;

public record OtpVerifyRequest(
    @NotBlank String channel,
    @NotBlank @Size(max = 254) String destination,
    @NotBlank @Pattern(regexp = "[0-9]{4,8}") String code) {}
