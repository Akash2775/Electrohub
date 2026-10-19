# Seller Center catalogue fields

The admin product editor is backed by the `products` table and `/api/admin/products` endpoints. Product data follows the same Controller → Service → Repository → JDBC repository structure as the rest of ElectroHub.

## Required listing fields

- Product name
- Brand
- Model number
- Seller SKU
- Category
- Selling price
- Main image

## Extended electronics fields

The V6 migration adds variant, warranty, return, HSN/GST, origin, shipping weight, low-stock threshold, maximum order quantity, COD/installation flags, videos, highlights, and specifications.

Product videos are uploaded through `/api/admin/uploads/video`. Local storage accepts MP4/WebM files up to 30 MB; the same endpoint can use the existing R2 storage provider configuration.

## Migration safety

`V5__customer_support.sql` remains byte-for-byte unchanged and keeps the Flyway checksum used by the existing development database. New schema changes are only in `V6__product_catalog_enrichment.sql`.
