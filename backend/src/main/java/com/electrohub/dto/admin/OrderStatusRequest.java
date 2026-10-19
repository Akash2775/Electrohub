package com.electrohub.dto.admin;

import jakarta.validation.constraints.NotBlank;

public record OrderStatusRequest(@NotBlank String status) {}
