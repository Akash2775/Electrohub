# ElectroHub — Electronics E-Commerce Platform

ElectroHub is a full-stack electronics store built with **React, Spring Boot, and MySQL**. It includes a customer storefront, account and order flows, and a protected owner dashboard for managing products, categories, inventory, and orders.

> **Development status:** This repository contains the application source and local setup scripts. Configure your own database and optional payment/email/SMS/storage credentials before using those integrations. Do not use demo data or test payment credentials for a live store.

## Features

### Customer storefront
- Browse the home page, shop, categories, deals, product details, and image galleries.
- Search products, manage a cart, save products, and maintain account/profile information.
- Sign up and sign in, add a shipping address at checkout, and view order status.
- Razorpay checkout integration (requires your own test/live credentials).

### Owner dashboard
- Manage products, prices, stock, featured/deal flags, and product images.
- Create, edit, and delete categories.
- View order information and update fulfilment status.
- Use a single configured owner account; public registration creates customer accounts only.

### Additional capabilities
- Responsive dark storefront UI with bundled category photographs.
- MySQL schema versioning with Flyway.
- Local image uploads during development.
- Optional integrations for Razorpay, Amazon SES SMTP, MSG91 OTP, and Cloudflare R2. These require configuration and are not enabled by default.

## Tech stack

| Layer | Technology |
| --- | --- |
| Frontend | React, Vite, React Router |
| Backend | Java 17+, Spring Boot 3 |
| Database | MySQL 8.0.16+ |
| Database migrations | Flyway |
| Build tools | npm, Maven |
| Payments | Razorpay (optional; configure your own credentials) |

## Project structure

```text
Electrohub/
├── frontend/       # React + Vite application
├── backend/        # Spring Boot REST API
├── database/       # MySQL database/user setup script
└── docs/           # Architecture, validation, and integration notes
```

Backend source is organised by responsibility: controllers, DTOs, services, repositories, and JDBC repository implementations. Flyway migrations are stored under `backend/src/main/resources/db/migration`.

## Getting started

### 1. Prerequisites

Install the following tools:

- **Git**
- **Java 17 or newer**
- **Maven**
- **Node.js 20.19 or newer** (Node 22.12+ recommended) and npm
- **MySQL 8.0.16 or newer**

Check your installations:

```bash
git --version
java -version
mvn -version
node -v
npm -v
mysql --version
```

### 2. Clone the repository

Open a terminal in the directory where you keep your projects:

```bash
git clone https://github.com/Akash2775/Electrohub.git
cd Electrohub
```

If you already cloned the repository, update your local copy instead:

```bash
git pull origin main
```

### 3. Create the MySQL database and user

1. Open `database/setup.sql`.
2. Replace `CHANGE_THIS_DATABASE_PASSWORD` with a strong password of your choice and save the file.
3. Run the script as a MySQL administrator. On Windows, you can open the file in **MySQL Workbench**, connect as an administrator, and execute it. Alternatively, run the following from **Command Prompt** (not PowerShell) in the repository root:

```bat
mysql -u root -p < database\setup.sql
```

On Ubuntu/Linux:

```bash
sudo mysql < database/setup.sql
```

The script creates the `electrohub` database and its local database user. Flyway creates and versions the application tables when the backend starts; you do not need to import a separate database dump.

**Important:** If the MySQL user already exists, `CREATE USER IF NOT EXISTS` does not change its password. Make sure the password you enter in the backend configuration matches the existing MySQL user's password.

### 4. Configure and start the backend

In a terminal, from the repository root:

```bash
cd backend
python setup_local.py
```

On Linux/macOS, use `python3 setup_local.py` if `python` points to a different version.

Enter your owner email, owner password, and MySQL user's password when prompted. The script creates `backend/.env` and preserves it if it already exists. The generated file is ignored by Git and must **never** be committed or shared.

Then start the backend from the same `backend` directory:

```bash
python run_local.py
```

On Linux/macOS, use `python3 run_local.py` if needed.

The API runs at **http://localhost:8080**. Keep this terminal open while using the frontend. If you prefer manual configuration, copy `backend/.env.example` to `backend/.env` and fill in the values. At minimum, configure:

```dotenv
DB_URL=jdbc:mysql://localhost:3306/electrohub?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
DB_USERNAME=electrohub
DB_PASSWORD=your_mysql_user_password
ADMIN_EMAIL=you@example.com
ADMIN_PASSWORD=your_unique_password_at_least_12_characters
```

The owner account is created on the first startup. Changing `ADMIN_PASSWORD` later is **not** a password-reset operation. Keep your owner credentials safe.

### 5. Install and start the frontend

Open a **second terminal** at the repository root:

```bash
cd frontend
npm ci
npm run dev
```

Open **http://localhost:5173** in your browser. The Vite development proxy forwards `/api` and `/uploads` requests to the backend on port 8080. Keep using `localhost` consistently during a session rather than switching between `localhost` and `127.0.0.1`.

## Local login and demo data

- Sign in with the owner email and password configured in `backend/.env` to access the owner dashboard.
- Use the sign-up flow to create a customer account.
- The application seeds eight demo products by default for local testing. Set `SEED_CATALOG=false` in `backend/.env` before the first startup if you want to skip the initial demo catalogue.
- Replace demo product descriptions, prices, and photos with accurate information before any real sales.

## Optional integrations

### Razorpay payments
Add your own Razorpay **test-mode** credentials to `backend/.env`:

```dotenv
RAZORPAY_KEY_ID=your_test_key_id
RAZORPAY_KEY_SECRET=your_test_key_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
```

Restart the backend after changing environment variables. For local webhook testing, you will need a public HTTPS tunnel and a webhook configured in the Razorpay dashboard. Follow the official [Razorpay Standard Checkout documentation](https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/integration-steps/) and [webhook validation guide](https://razorpay.com/docs/webhooks/validate-test/). Keep secret keys on the backend only. Use test mode until your integration has been verified.

### Email, OTP, and remote image storage
Amazon SES SMTP, MSG91, and Cloudflare R2 settings are available in `backend/.env.example`. They are optional and require your own provider accounts and credentials. Read `docs/PRODUCTION-INTEGRATIONS.md` before enabling them.

## Validation commands

Run these commands from the indicated directories:

**Frontend** (`frontend/`):

```bash
npm run build
npm run lint
npm test
```

**Backend** (`backend/`):

```bash
mvn test
mvn package
```

These are the project's available validation commands; results may depend on your local tool versions and configuration. See `docs/VALIDATION.md` for project-specific validation notes.

## Troubleshooting

- **MySQL access denied:** Confirm that `DB_PASSWORD` matches the password for the `electrohub` MySQL user.
- **Backend cannot connect to MySQL:** Check that the MySQL service is running and listening on port 3306.
- **Java/Maven version error:** Run `mvn -version` and verify Maven is using Java 17 or newer.
- **Port already in use:** Stop the other process using port 8080 or 5173 before starting ElectroHub.
- **Payment setup is incomplete:** Add valid Razorpay test credentials to `backend/.env` and restart the backend. Never publish your secret key.
- **Image upload fails:** Sign in as the owner and upload a supported JPG or PNG image within the configured size limit.
- **Frontend changes are not visible:** Ensure commands are running from this repository's `frontend` directory, then refresh the browser.

## Security notes

- Never commit `backend/.env`, passwords, API secrets, or live payment credentials.
- Keep `COOKIE_SECURE=false` for local HTTP development only. Configure HTTPS and `COOKIE_SECURE=true` in production.
- Production use also requires secure hosting, persistent storage for uploads, database backups, and accurate store policies/contact details.
- This project does not migrate users, products, or orders from a previous MongoDB or Supabase database.

## Documentation

- `docs/ARCHITECTURE.md` — application architecture and dependency flow.
- `docs/VALIDATION.md` — validation notes and remaining manual checks.
- `docs/PRODUCTION-INTEGRATIONS.md` — optional integrations and production configuration.

---

Built as a full-stack project for learning and demonstrating frontend, backend, database, and e-commerce integration skills.
