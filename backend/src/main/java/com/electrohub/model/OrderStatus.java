package com.electrohub.model;

import java.util.Optional;

public enum OrderStatus {
  PENDING,
  PAID,
  PAID_REVIEW,
  PROCESSING,
  SHIPPED,
  DELIVERED;

  public Optional<OrderStatus> nextFulfilmentStatus() {
    return switch (this) {
      case PAID -> Optional.of(PROCESSING);
      case PROCESSING -> Optional.of(SHIPPED);
      case SHIPPED -> Optional.of(DELIVERED);
      default -> Optional.empty();
    };
  }
}
