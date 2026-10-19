package com.electrohub.dto.auth;

import jakarta.validation.constraints.*;

public record RegisterStartRequest(
    @NotBlank @Size(max = 100) String name,
    @NotBlank @Email @Size(max = 254) String email,
    @NotBlank @Pattern(regexp = "[6-9][0-9]{9}") String phone,
    @Size(min = 10, max = 72) @NotNull String password) {}
