# ElectroHub update — Seller Center catalogue upgrade

This build adds a production-style electronics product editor while preserving the layered backend structure and the existing V5 Flyway checksum.

## Admin / catalogue
- Brand, model number and seller SKU
- Color and variant/configuration
- Warranty and replacement/return days
- HSN, GST, country of origin and shipping weight
- Low-stock threshold and per-order quantity limit
- COD and installation flags
- Up to 10 highlights and 30 technical specifications
- Main image, 8 gallery images and up to 3 MP4/WebM product videos
- Product search by name, brand, model and SKU
- Low-stock filtering, product preview and copy-model action
- Animated cards, collapsible editor sections and sticky listing readiness preview

## Storefront
- Brand/model metadata appears on product cards and detail pages
- Product detail page renders highlights, specification table, warranty/return information and product videos
- Search includes brand, model number, SKU, color and variant
- Checkout respects the product-specific maximum order quantity

## Database
V6__product_catalog_enrichment.sql is append-only. V5__customer_support.sql was not changed.

---

# ElectroHub Electronics UI Update

Implemented for the requested customer shopping flow:

1. Shop/search is electronics-only and clearly scoped to Smartphones, Laptops, Audio, Gaming, TVs, Wearables, Cameras and Components.
2. Search page now has electronic-category shortcuts and filters for category, price, customer rating, tech features, stock, deals and sorting.
3. Logged-in customer account menu now exposes My Profile, Orders, Notifications and Customer Care directly from the navbar.
4. My Orders now supports Order ID search, status filters, recent-period filters and quick filter chips.
5. Account page now includes a full Notifications section.
6. Customer Care is functional: customers can create support tickets and view their ticket history.
7. Added `V4__customer_support.sql` and `SupportController.java` for persistent customer support tickets.

Frontend validation completed:
- `npm run build` passed
- `npm run lint` passed
- `npm test -- --run` passed (5/5 tests)

Backend Maven tests were not executed in the editing environment because the `mvn` command is not installed there.

## Direct Buy Now
- Added **Buy Now** beside **Add to Cart** on electronics product cards.
- Added **Buy Now** on the product details page.
- Buy Now opens a dedicated direct-checkout route for only the selected product and does not replace or clear the customer's normal cart.
- Quantity can be adjusted during direct checkout, subject to stock and the existing quantity limit.
- If the customer is not signed in, login returns them to the same Buy Now checkout.
- Successful Buy Now payment leaves the normal shopping cart untouched.
