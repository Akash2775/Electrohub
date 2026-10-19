package com.electrohub.dto.support;

import com.electrohub.model.SupportTicketType;
import jakarta.validation.constraints.*;

public record SupportTicketRequest(
    @NotNull SupportTicketType type,
    @NotBlank @Size(min = 5, max = 120) String subject,
    @NotBlank @Size(min = 10, max = 2000) String message) {}
