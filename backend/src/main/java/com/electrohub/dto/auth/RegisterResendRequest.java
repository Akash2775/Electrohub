package com.electrohub.dto.auth;

import jakarta.validation.constraints.NotBlank;

public record RegisterResendRequest(@NotBlank String registrationId, @NotBlank String channel) {}
