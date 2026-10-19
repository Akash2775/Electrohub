package com.electrohub.dto.auth;

import jakarta.validation.constraints.*;

public record RegisterVerifyRequest(
    @NotBlank String registrationId,
    @NotBlank String channel,
    @NotBlank @Pattern(regexp = "[0-9]{4,8}") String code) {}
