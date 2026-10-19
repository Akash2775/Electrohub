# Flyway migration note

Migration versions are append-only. Never rename or replace a migration after it has been applied.

This project may be used with an older ElectroHub development database that already contains a legacy
`V4__catalog_variants_receipts_and_media` entry in `flyway_schema_history`. That historical migration is
not part of this source snapshot, so `application.properties` ignores only missing *versioned* migrations
during validation. New schema changes continue at V5.

Current migrations:
- V1: store schema
- V2: production features
- V3: verified registration and gallery
- V5: customer support
- V6: richer product catalogue fields (brand, model number, SKU, warranty, tax, media, highlights and specifications)

For a new database, Flyway will apply the available migrations in version order; version gaps are valid.

## If V5 previously failed because `support_requests` already existed

The V5 script is idempotent in this package. Flyway may still have a failed V5 row from the previous
attempt. Run Flyway repair (preferred) or remove only that failed V5 history row, then run the app again.
Do not drop the `support_requests` table if it contains data.
