package com.electrohub.dto.order;

import jakarta.validation.constraints.NotBlank;

public record PaymentVerifyRequest(
    @NotBlank String localOrderId,
    @NotBlank String razorpay_order_id,
    @NotBlank String razorpay_payment_id,
    @NotBlank String razorpay_signature) {}
