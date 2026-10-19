<<<<<<< HEAD
# ElectroHub — React + Spring Boot + MySQL

A working electronics store based on the supplied Circuit Spark Boutique frontend. The original dark background, cyan/purple palette, glass navigation, hero structure, category grid and product cards are retained in a compact React implementation. Category symbols have been replaced by bundled photographs.

## What is included

- Home, Shop, Categories, Deals, About, search, product details and galleries.
- ONE shared Sign In page. Owner credentials open `/admin`; customer credentials open `/account`.
- Customer signup, cart, saved products, shipping address at checkout, Razorpay payment and order status.
- Owner dashboard: real database counts, product create/edit/archive, category create/edit/delete, local photo uploads and order fulfilment updates.
- Only one owner: a unique nullable owner slot plus a SQL CHECK constraint, seeded from backend configuration. Public registration always creates CUSTOMER accounts. No role selector or admin signup.
- Same dark visual style for customer and owner screens; responsive layouts, hover effects, entrance animation, floating hero and operating-system reduced-motion support.
- Image preview, galleries, stock, featured/deal flags, INR prices; eight bundled category photographs.
- Newsletter subscribe/unsubscribe stores consented addresses. No newsletter emails are sent automatically.

Removed: Supabase, seller/marketplace accounts, “Sell your device”, separate admin-login tab, MongoDB, Redis, Docker and unused UI libraries. Dummy footer links for unimplemented careers/gift-card/affiliate pages were removed. No fabricated star ratings, large customer counts, countdown expiry or newsletter discount promise.

## 1. Prerequisites (Ubuntu)

This version uses **Java 17 or newer** — Java 21 also works. Node **22.12+** is needed for the frontend. MySQL **8.0.16+** is required so SQL CHECK constraints are enforced.

```bash
sudo apt update
sudo apt install openjdk-17-jdk maven mysql-server
sudo systemctl start mysql
java -version
mvn -version
node -v
```

If Maven points at a missing/wrong JAVA_HOME on Ubuntu amd64:

```bash
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
export PATH="$JAVA_HOME/bin:$PATH"
```

Use your installed JDK path if different. Do not run the old MongoDB backend alongside this one: both use port 8080.

## 2. Create your MySQL database

Extract this ZIP, open a terminal in the `ElectroHub` folder and edit `database/setup.sql`. Replace `CHANGE_THIS_DATABASE_PASSWORD` with your own database password. Use that same password in the backend setup below.

```bash
sudo mysql < database/setup.sql
```

If your MySQL root account uses password login, use `mysql -u root -p < database/setup.sql` instead.

Test the database user:

```bash
mysql -h localhost -u electrohub -p electrohub
```

Type `exit` to leave MySQL. Flyway will create the tables automatically when the backend starts. You do not need to import a database dump.

## 3. Configure and start the backend

```bash
cd backend
python3 setup_local.py
```

Enter your owner email, owner password and MySQL user's password. This creates **backend/.env**. The file is preserved if it already exists. You can also copy `.env.example` to `.env` and edit it manually.

Essential values:

```dotenv
DB_URL=jdbc:mysql://localhost:3306/electrohub?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
DB_USERNAME=electrohub
DB_PASSWORD=your_mysql_user_password
ADMIN_EMAIL=your_owner_email
ADMIN_PASSWORD=your_unique_password_at_least_12_characters
```

Then:

```bash
python3 run_local.py
```

Leave this terminal running. Backend: **http://localhost:8080**. This is an API, not the storefront.

The owner is created once, on the first start. Restarting does not create another owner and does not overwrite the existing owner's password. Changing ADMIN_PASSWORD later is not a password-reset operation. Never register another account to try to create an owner.

The eight `Demo` products are seed data for local testing. Set `SEED_CATALOG=false` before the first run if you prefer an empty store. Replace demo descriptions/prices/photos with your real inventory before live sales. Changing this flag does not remove previously seeded products.

## 4. Start the frontend in a second terminal

From the extracted `ElectroHub` directory:

```bash
cd frontend
npm ci
npm run dev
```

Open **http://localhost:5173**. Use the same hostname consistently (do not alternate between localhost and 127.0.0.1 during a session).

The Vite proxy connects `/api` and `/uploads` to the backend at port 8080. No frontend secret keys or frontend `.env` are required. If you change the backend port, change `frontend/vite.config.js` to match.

## 5. Owner and customer login

1. Click the user icon in the header.
2. Enter the ADMIN_EMAIL / ADMIN_PASSWORD saved in backend/.env.
3. You are sent directly to the owner dashboard.
4. Add/edit products, categories, prices and stock; upload real product photos.
5. Sign out. Choose **Sign Up** on the same login page to create a customer.
6. Customers see their orders, saved products and profile. They cannot access the owner APIs.

There is no “Admin login” button, no public admin registration, and no seller flow. Customer accounts have no preset numeric limit.

## 6. Images — no Cloudinary setup required

- Owner → Products → Add product / Edit → choose a main image.
- JPG and PNG, up to 5 MB and 16 megapixels. Wait for “Image uploaded” before saving.
- Optionally add up to six gallery images.
- Owner → Categories → Edit → choose a category photograph → Save.
- Backend checks image content, decodes it and re-encodes a PNG using a generated filename. It never uses an uploaded filename as a filesystem path.
- New files persist in `backend/uploads/`. Keep this folder when replacing code or backing up the database. An existing product/order can still reference an older image.
- Bundled category photos live in `frontend/public/images/`; they do not depend on remote image loading at runtime.
- Cloudinary credentials from the old project are not used by this implementation.

## 7. Razorpay, step by step

1. In your Razorpay dashboard, select Test Mode and obtain a test Key ID and Key Secret.
2. Edit **backend/.env**:

```dotenv
RAZORPAY_KEY_ID=your_test_key_id
RAZORPAY_KEY_SECRET=your_test_key_secret
RAZORPAY_WEBHOOK_SECRET=your_own_long_random_webhook_secret
```

Generate a webhook secret locally if needed:

```bash
python3 -c "import secrets; print(secrets.token_hex(32))"
```

3. Restart the backend with `python3 run_local.py` so it loads the changes.
4. For local webhook delivery, run `ngrok http 8080` in another terminal. This new backend uses **8080**, not the old Docker port 8088.
5. Razorpay Dashboard → Account & Settings → Webhooks → Add New Webhook. Use:

```text
https://YOUR-NGROK-HOST/api/payments/webhook
```

6. Enter the SAME secret as RAZORPAY_WEBHOOK_SECRET. Select **payment.captured** and **order.paid**. Save the enabled webhook in Test Mode. Update the URL if your tunnel hostname changes.
7. Configure automatic capture in Razorpay. An authorised but uncaptured payment stays pending; it is never shown as paid merely because checkout closed.
8. Sign in as a customer, add a product to the cart, enter the address, and click Pay. Use Razorpay's test payment flow. No real funds are needed in Test Mode.
9. Confirm the order changes to Paid, the Razorpay dashboard shows capture, and the webhook delivery receives HTTP 200. Duplicate events do not reduce inventory again.
10. Verify failed/cancelled checkout, server restart and webhook retry before switching to live credentials. Live operation requires the Razorpay account to be activated and separate live-mode webhook configuration.

The Key ID is passed to checkout; the API secret and webhook secret stay on the backend. Server-side order prices and quantities are authoritative. Checkout signatures and webhook HMAC signatures are checked. The callback fetches the payment from Razorpay and checks provider order ID, currency and amount before applying a capture.

Payment docs: [Standard checkout](https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/integration-steps/), [Webhook validation](https://razorpay.com/docs/webhooks/validate-test/).

### Payment / stock behaviour to understand

- A checkout request has an idempotency key; retrying it returns the same local/provider order.
- Pending orders do not reserve inventory. At capture, the backend locks product rows, checks stock and decrements once.
- If another customer bought the last unit before capture, the payment is recorded as **Paid · owner review**, rather than silently discarding payment or creating negative stock. The owner must arrange fulfilment or refund through Razorpay. Such an order cannot be advanced by the normal ship/deliver buttons.
- The owner cannot manually mark an unpaid order as paid. Only verified capture can do that.
- Normal fulfilment is PAID → PROCESSING → SHIPPED → DELIVERED.
- Refunds are handled in the Razorpay dashboard; automated refund/return workflows are not included. No extra return-request UI was added.
- If callback verification temporarily fails, check My orders and allow the webhook to reconcile before paying again. The pending details page refreshes every ten seconds.

## 8. Validation

Frontend:

```bash
cd frontend
npm run build
npm run lint
npm test
```

Backend:

```bash
cd backend
mvn test
mvn package
```

The backend integration suite uses H2 in MySQL compatibility mode and a mocked Razorpay gateway, so it does not charge money or require your database credentials. It covers singleton owner enforcement, customer/admin access, CSRF, image validation and serving, checkout idempotency, server-side pricing, order ownership, amount/currency checks, payment replay and HMAC tamper rejection.

See `docs/VALIDATION.md` for the checks actually run while preparing this ZIP and remaining manual checks.

## 9. Troubleshooting

- **Access denied for user electrohub:** DB_PASSWORD must match the MySQL user. Existing users are not reset by `CREATE USER IF NOT EXISTS`.
- **Communications link failure / connection refused:** `sudo systemctl status mysql`; confirm MySQL is listening on 3306. This project does not use 27017/27018.
- **Maven Java error:** run `mvn -version`. Java 17 or newer is sufficient here.
- **Port 8080 / 5173 in use:** stop the old project first.
- **Payments not configured:** add Razorpay keys to backend/.env and restart. The app does not simulate a successful paid order when keys are missing.
- **Invalid webhook signature:** the webhook secret is separate from the Razorpay API secret; dashboard and backend must match exactly.
- **Expired session/CSRF:** refresh the page and sign in again. Backend restart invalidates in-memory sessions.
- **Image upload fails:** use a real JPG/PNG below the limits, sign in as owner, and keep the backend running. SVG and WebP uploads are deliberately not accepted.
- **New UI not visible:** run npm from this ZIP's frontend directory, stop any old Vite process and hard refresh the browser.

## Project structure

The source is organised as a layered application instead of keeping all Java/React files in one folder.

```text
ElectroHub/
  frontend/
    src/
      app/                    Application router
      components/common/      Reusable UI components
      context/                React store/context
      hooks/                  Reusable React hooks
      pages/                  Account, admin, checkout and store pages
      services/               HTTP/API client
      styles/                 Global CSS
      tests/                  Frontend tests
      utils/                  Formatting/helpers
    index.html
    vite.config.js

  backend/
    src/main/java/com/electrohub/
      config/                 Spring Security/application configuration
      controller/             REST endpoints only
      dto/                    Validated request DTOs
      model/                  Domain enums/models
      repository/             Repository interfaces
      repository/jdbc/        MySQL/JdbcTemplate implementations
      service/                Service abstractions/interfaces
      service/impl/           Business-logic implementations
      integration/payment/    Razorpay adapter
      database/               Seed/bootstrap database logic
      exception/              Central API exception handling
      util/                   Shared validators/helpers
    src/main/resources/db/migration/  Flyway migrations
    src/test/                         Integration/security/payment tests
    .env.example                      Credentials template
    setup_local.py                    First-time local configuration
    run_local.py                      Loads .env and starts Spring Boot

  database/setup.sql          Database/user setup
  docs/ARCHITECTURE.md        Layer responsibilities and dependency flow
```

Backend dependency flow: **Controller → Service interface → Service implementation → Repository interface → JDBC repository → MySQL**. Controllers do not contain SQL, and `JdbcTemplate` is isolated under `repository/jdbc`.

This is a new MySQL implementation. It does **not** migrate users, passwords, products or orders from your previous MongoDB or Supabase database. Keep the previous project/database as a backup.

Production hosting requires HTTPS, COOKIE_SECURE=true, a persistent upload volume, database backups, your real store/contact/returns policies and same-origin routing for the frontend, /api and /uploads. The sample database URL is for localhost development; configure verified database TLS for remote hosting. No deployment, live payment test or external email delivery has been performed by this ZIP.

## Production integrations added

This build includes optional email/mobile OTP login, Amazon SES SMTP transactional emails, MSG91 mobile OTP hooks, Cloudflare R2 image storage, persistent in-app order notifications, and verified-purchase product reviews. All paid integrations are disabled until credentials are entered in `backend/.env`.

See `docs/PRODUCTION-INTEGRATIONS.md` before going live.

## Flyway / existing ElectroHub databases

Some existing local ElectroHub databases contain a legacy V4 migration named `catalog variants receipts and media`.
This source snapshot does not redefine that migration. Customer Support is V5, and Flyway is configured to ignore
only missing versioned migrations so the legacy database can start without rewriting migration history.

## Electronics marketplace UI refresh

The public storefront uses an ElectroHub-branded marketplace layout focused only on electronics. The header includes search, login/account, notifications, customer care and cart. The electronics navigation and discovery areas link only to technology categories. The order-details screen uses a two-column marketplace layout with product summary, status timeline, delivery details, price breakdown, payment reference, customer-care link and a browser-print invoice action.

Frontend runtime: Node.js 20.19+ (or Node.js 22.12+ recommended for the current Vite toolchain).
=======
# Electrohub
>>>>>>> 949b370a8fe2dbc5121cac2994c2b523a0647b8e
