package com.electrohub.service;

import com.fasterxml.jackson.databind.JsonNode;

public interface PaymentGateway {
  String key();
  void ready();
  JsonNode order(long amount, String receipt);
  JsonNode payment(String id);
  boolean checkoutSignature(String order, String payment, String signature);
  boolean webhookSignature(byte[] body, String signature);
}
