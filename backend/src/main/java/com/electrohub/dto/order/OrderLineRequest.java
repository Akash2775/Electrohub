package com.electrohub.dto.order;

import jakarta.validation.constraints.*;

public record OrderLineRequest(@NotBlank String productId, @Min(1) @Max(10) int quantity) {}
