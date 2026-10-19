package com.electrohub.dto.catalog;

import jakarta.validation.constraints.*;

public record SubscriptionRequest(@NotBlank @Email @Size(max = 254) String email) {}
