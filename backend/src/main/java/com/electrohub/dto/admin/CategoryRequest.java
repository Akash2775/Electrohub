package com.electrohub.dto.admin;

import jakarta.validation.constraints.*;

public record CategoryRequest(
    @NotBlank @Size(max = 80) String name,
    @NotBlank String image_url,
    @NotNull @Size(max = 500) String description) {}
