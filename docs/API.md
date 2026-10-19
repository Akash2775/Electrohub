# API map

Base path `/api`. JSON responses use snake_case database fields except the checkout response. Errors contain `{ "message": "..." }`.

Session-based authentication uses an HttpOnly JSESSIONID cookie. Fetch `GET /auth/csrf` and include the returned headerName/token on non-GET requests. `/payments/webhook` instead requires the Razorpay HMAC signature. Keep cookies on requests.

| Method | Path | Access / purpose |
|---|---|---|
| GET | /auth/csrf | Public; CSRF token |
| POST | /auth/register | Public; name, email, password. Always CUSTOMER |
| POST | /auth/login | Public; email, password. Returns id, name, email, role |
| GET | /auth/me | Current signed-in account |
| POST | /auth/logout | End session |
| GET | /products | Active catalogue |
| GET | /products/{id} | Active product |
| GET | /categories | Categories and real active-product counts |
| GET | /store | Store/currency information |
| POST | /newsletter | Public; email subscription |
| POST | /newsletter/unsubscribe | Public; email removal |
| POST | /orders | CUSTOMER; create provider/local order |
| GET | /orders | CUSTOMER; own orders |
| GET | /orders/{id} | CUSTOMER; own order plus item snapshots |
| POST | /payments/verify | CUSTOMER; signed checkout callback |
| POST | /payments/webhook | Signed provider event, no login cookie |
| GET | /admin/summary | ADMIN; metrics |
| GET, POST | /admin/products | ADMIN; all products / create |
| PUT, DELETE | /admin/products/{id} | ADMIN; edit / archive |
| POST | /admin/categories | ADMIN; create |
| PUT, DELETE | /admin/categories/{id} | ADMIN; edit / delete only if not referenced |
| POST | /admin/uploads | ADMIN; multipart field `file` |
| GET | /admin/orders | ADMIN; orders with customer email |
| GET | /admin/orders/{id}/items | ADMIN; item snapshots |
| PATCH | /admin/orders/{id} | ADMIN; next fulfilment status |

Order creation:

```json
{
  "checkoutKey": "a-random-uuid-for-this-checkout",
  "items": [{"productId":"database-product-uuid","quantity":1}],
  "recipient": "Customer Name",
  "phone": "9876543210",
  "address": "Building, street, area, Pune, Maharashtra",
  "pincode": "411001"
}
```

Returns `{id, orderId, amount, currency, key, status}`. `id` is the local UUID; `orderId` is the Razorpay order ID; `amount` is in paise. Client-supplied totals are never used.

Payment verify payload:

```json
{
  "localOrderId":"local-order-uuid",
  "razorpay_order_id":"order_...",
  "razorpay_payment_id":"pay_...",
  "razorpay_signature":"hex-signature-from-checkout"
}
```

Product create/update:

```json
{
 "name":"Headphones", "description":"Product description", "category_id":"category-uuid",
 "price_paise":499900, "original_price_paise":599900, "stock":10,
 "image_url":"/uploads/generated-uuid.png", "images":["/uploads/generated-uuid.png"],
 "badge":"New", "featured":true, "deal":false, "active":true
}
```

Main/gallery images must be uploaded first. Product deletion archives so order snapshots remain valid. No role-management or create-owner API exists.

### Verified signup
- `POST /api/auth/register/start` — starts signup and sends both email and SMS OTPs.
- `POST /api/auth/register/verify` — verifies one signup OTP; creates/signs in the customer after both channels are verified.
- `POST /api/auth/register/resend` — resends the selected signup OTP.

Direct unverified `POST /api/auth/register` is disabled.

### Product images
Admin product create/update accepts `image_url` plus an `images` array containing up to 8 additional uploaded image URLs.
