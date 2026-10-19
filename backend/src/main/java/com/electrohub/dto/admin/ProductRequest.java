package com.electrohub.dto.admin;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public record ProductRequest(
    @NotBlank @Size(max = 160) String name,
    @NotBlank @Size(max = 10000) String description,
    @NotBlank String category_id,
    @Min(1) @Max(1000000000) long price_paise,
    @Min(0) @Max(1000000000) long original_price_paise,
    @Min(0) @Max(1000000) int stock,
    @NotBlank String image_url,
    @NotNull @Size(max = 8) List<String> images,
    @NotNull @Size(max = 30) String badge,
    @NotBlank @Size(max = 80) String brand,
    @NotBlank @Size(max = 100) String model_number,
    @NotBlank @Size(max = 80) String sku,
    @NotNull @Size(max = 60) String color,
    @NotNull @Size(max = 120) String variant_label,
    @Min(0) @Max(120) int warranty_months,
    @Min(0) @Max(30) int return_days,
    @NotNull @Size(max = 20) String hsn_code,
    @NotNull @DecimalMin("0.00") @DecimalMax("28.00") BigDecimal gst_percent,
    @NotBlank @Size(max = 80) String country_of_origin,
    @Min(0) @Max(100000) int shipping_weight_grams,
    @Min(0) @Max(1000000) int low_stock_threshold,
    @Min(1) @Max(10) int max_order_quantity,
    boolean cod_available,
    boolean installation_required,
    @NotNull @Size(max = 3) List<String> video_urls,
    @NotNull @Size(max = 10) List<@Size(max = 220) String> highlights,
    @NotNull @Size(max = 30) Map<@Size(max = 80) String, @Size(max = 240) String> specifications,
    boolean featured,
    boolean deal,
    boolean active) {}
