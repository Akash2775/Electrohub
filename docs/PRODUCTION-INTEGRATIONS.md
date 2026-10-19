# ElectroHub Production Integrations

The code is wired for production providers, but paid providers are **disabled by default**. Adding these features does not create charges until you create provider accounts, add credentials, and enable them.

## 1. Email OTP + transactional order email (Amazon SES SMTP)

Set in `backend/.env`:

```env
MAIL_ENABLED=true
MAIL_FROM=no-reply@yourdomain.com
SMTP_HOST=email-smtp.ap-south-1.amazonaws.com
SMTP_PORT=587
SMTP_USERNAME=YOUR_SES_SMTP_USERNAME
SMTP_PASSWORD=YOUR_SES_SMTP_PASSWORD
OTP_PEPPER=GENERATE_A_LONG_RANDOM_SECRET
```

Generate the OTP pepper with `openssl rand -hex 32`. Do not commit it.

Emails are sent for welcome, payment received, processing, shipped and delivered events. Email failure is logged and does not remove the persistent in-app notification.

## 2. Mobile OTP (MSG91)

Create/approve the required Indian DLT entity, sender/template setup in MSG91, then set:

```env
MSG91_ENABLED=true
MSG91_AUTH_KEY=YOUR_MSG91_AUTH_KEY
MSG91_TEMPLATE_ID=YOUR_APPROVED_OTP_TEMPLATE_ID
```

Mobile OTP is disabled until `MSG91_ENABLED=true`. The application accepts a normal 10-digit Indian mobile number and sends the provider request with country code `91`.

## 3. Cloud product images (Cloudflare R2)

During development keep:

```env
STORAGE_PROVIDER=local
```

For live cloud storage:

```env
STORAGE_PROVIDER=r2
R2_ACCOUNT_ID=YOUR_CLOUDFLARE_ACCOUNT_ID
R2_ACCESS_KEY_ID=YOUR_R2_ACCESS_KEY_ID
R2_SECRET_ACCESS_KEY=YOUR_R2_SECRET_ACCESS_KEY
R2_BUCKET=electrohub-products
R2_PUBLIC_BASE_URL=https://YOUR_PUBLIC_R2_DOMAIN
```

The existing admin image upload automatically switches from local `/uploads` storage to R2 when `STORAGE_PROVIDER=r2`.

## 4. Razorpay

The existing Razorpay payment flow remains in place. For live mode set:

```env
RAZORPAY_KEY_ID=rzp_live_...
RAZORPAY_KEY_SECRET=...
RAZORPAY_WEBHOOK_SECRET=...
```

Configure the Razorpay webhook URL as:

```text
https://YOUR_API_DOMAIN/api/payments/webhook
```

Payment capture creates an in-app notification and transactional email. Duplicate Razorpay callbacks remain idempotent.

## 5. Notifications

No third-party service is required for the website notification bell. Notifications are stored in MySQL and customers receive them for:

- account creation
- successful payment
- payment requiring owner review
- processing
- shipped
- delivered

The frontend checks for new notifications every 30 seconds and customers can mark notifications read.

## 6. Product reviews

Reviews are restricted to authenticated customers who have a `DELIVERED` order containing the product. One review is stored per customer/product; submitting again updates the existing review. Product pages show the average rating, review count, review text, and a verified-purchase marker.

## 7. Database migration

Flyway automatically applies `V2__production_features.sql`, which adds:

- customer phone + verification flags
- OTP challenge storage
- notifications
- verified-purchase reviews

Back up the live database before the first production migration.

## Important production settings

Use HTTPS and set:

```env
COOKIE_SECURE=true
SEED_CATALOG=false
```

Replace all Demo catalogue data before accepting real customer payments. Never commit `backend/.env`.

## Verified customer signup

Customer signup is now a permanent two-contact verification flow:

1. `POST /api/auth/register/start` accepts name, email, Indian mobile number and password.
2. ElectroHub creates only a temporary `pending_registrations` record and sends OTPs to both contacts.
3. `POST /api/auth/register/verify` verifies EMAIL and SMS independently.
4. The real `users` row is created only after both OTPs succeed. New customers are stored with `email_verified=true` and `phone_verified=true`.
5. `POST /api/auth/register/resend` can resend an unverified contact OTP, subject to rate limiting.

Production signup therefore requires both `MAIL_ENABLED=true` with valid SMTP/SES credentials and `MSG91_ENABLED=true` with a valid MSG91 OTP template. `OTP_PEPPER` must also be a long random secret.

## Multi-image product gallery

Admin products keep `image_url` as the primary/listing image and can store up to 8 additional gallery images in `images`. The admin UI supports selecting several JPG/PNG files in one file picker action. Every image still passes the existing server-side image validation and is saved through the configured storage provider (`local` or `r2`). The product detail page displays the primary image plus all gallery images as selectable thumbnails.
