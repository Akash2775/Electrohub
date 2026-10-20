ALTER TABLE products
ADD COLUMN model_number VARCHAR(100) NOT NULL DEFAULT '';

CREATE INDEX idx_products_brand_model
ON products(brand, model_number);