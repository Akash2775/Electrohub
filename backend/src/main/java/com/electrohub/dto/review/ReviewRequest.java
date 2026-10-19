package com.electrohub.dto.review;

import jakarta.validation.constraints.*;

public record ReviewRequest(
    @Min(1) @Max(5) int rating,
    @NotNull @Size(max = 120) String title,
    @NotNull @Size(max = 2000) String body) {}
