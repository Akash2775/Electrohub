package com.electrohub.dto.order;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.util.List;

public record CheckoutRequest(
    @NotBlank @Size(max = 80) String checkoutKey,
    @NotEmpty @Size(max = 30) List<@Valid OrderLineRequest> items,
    @NotBlank @Size(max = 100) String recipient,
    @Pattern(regexp = "[6-9][0-9]{9}") @NotNull String phone,
    @NotBlank @Size(min = 10, max = 500) String address,
    @Pattern(regexp = "[1-9][0-9]{5}") @NotNull String pincode) {}
