ALTER TABLE products
  ADD COLUMN brand VARCHAR(80) NOT NULL DEFAULT '',
  ADD COLUMN sku VARCHAR(80) NOT NULL DEFAULT '',
  ADD COLUMN color VARCHAR(60) NOT NULL DEFAULT '',
  ADD COLUMN variant_label VARCHAR(120) NOT NULL DEFAULT '',
  ADD COLUMN warranty_months INT NOT NULL DEFAULT 12,
  ADD COLUMN return_days INT NOT NULL DEFAULT 7,
  ADD COLUMN hsn_code VARCHAR(20) NOT NULL DEFAULT '',
  ADD COLUMN gst_percent DECIMAL(5,2) NOT NULL DEFAULT 18.00,
  ADD COLUMN country_of_origin VARCHAR(80) NOT NULL DEFAULT 'India',
  ADD COLUMN shipping_weight_grams INT NOT NULL DEFAULT 0,
  ADD COLUMN low_stock_threshold INT NOT NULL DEFAULT 5,
  ADD COLUMN max_order_quantity INT NOT NULL DEFAULT 10,
  ADD COLUMN cod_available BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN installation_required BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN video_urls LONGTEXT NULL,
  ADD COLUMN highlights LONGTEXT NULL,
  ADD COLUMN specifications LONGTEXT NULL;

CREATE INDEX idx_products_brand_model
  ON products(brand, model_number);

CREATE INDEX idx_products_sku
  ON products(sku);
