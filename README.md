# ElectroHub — Full-Stack Electronics E-Commerce Platform

ElectroHub is a full-stack electronics e-commerce application built with **React, Spring Boot, and MySQL**. It provides a customer-facing storefront, product discovery, cart and checkout workflows, account management, order tracking, and a protected owner dashboard for managing products, categories, inventory, and orders.

The project demonstrates full-stack application development, REST API integration, relational database management, authentication, and e-commerce workflows.

> **Development status:** This repository includes application source code and local setup scripts. Database access and optional third-party integrations require your own configuration and credentials. The project is intended for development and demonstration until production requirements are completed.

## Features

### Customer Storefront
- Browse electronics, categories, featured products, deals, and product details.
- Search for products and explore product image galleries.
- Add products to the cart and save products for later.
- Register, sign in, and manage account and profile information.
- Add a shipping address during checkout and view order status.
- Integrate Razorpay checkout when payment credentials are configured.

### Owner Dashboard
- Create, update, and manage products and prices.
- Manage inventory, featured products, deals, and product images.
- Create, edit, and delete product categories.
- View customer orders and update fulfilment status.
- Access protected owner functionality through a configured owner account.

### Additional Capabilities
- Responsive dark-themed storefront.
- MySQL database with Flyway schema migrations.
- Local image uploads during development.
- Optional integrations for Razorpay payments, Amazon SES SMTP, MSG91 OTP, and Cloudflare R2 storage.
- Frontend and backend validation commands.

## Technology Stack

| Layer | Technologies |
|---|---|
| Frontend | React, Vite, React Router |
| Backend | Java 17+, Spring Boot 3 |
| Database | MySQL 8.0.16+ |
| Database migrations | Flyway |
| API | REST API |
| Frontend tooling | Node.js, npm |
| Backend build | Maven |
| Payment integration | Razorpay (optional) |

## Project Structure

```text
Electrohub/
├── frontend/       # React + Vite application
├── backend/        # Spring Boot REST API
├── database/       # MySQL database and user setup
└── docs/           # Architecture and setup documentation
```

The backend separates application responsibilities into controllers, DTOs, services, repositories, and JDBC repository implementations. Database migrations are maintained in `backend/src/main/resources/db/migration`.

## Getting Started

Follow these instructions to run ElectroHub locally.

### Prerequisites

Install the following software:

- Git
- Java 17 or newer
- Maven
- Node.js 20.19 or newer (Node.js 22.12+ recommended) and npm
- MySQL 8.0.16 or newer

Verify your installations:

```bash
git --version
java -version
mvn -version
node -v
npm -v
mysql --version
```

### 1. Clone the Repository

Open a terminal in your preferred projects directory:

```bash
git clone https://github.com/Akash2775/Electrohub.git
cd Electrohub
```

If you have already cloned the repository, navigate to your local repository and pull the latest changes:

```bash
git pull origin main
```

### 2. Configure MySQL

1. Open `database/setup.sql`.
2. Replace `CHANGE_THIS_DATABASE_PASSWORD` with a strong password and save the file.
3. Run the setup script as a MySQL administrator.

**Windows:** You can execute the script through MySQL Workbench. Alternatively, run the following command from **Command Prompt**, in the repository root:

```bat
mysql -u root -p < database\\setup.sql
```

**Ubuntu/Linux:**

```bash
sudo mysql < database/setup.sql
```

The script creates the `electrohub` database and its local database user. Flyway creates and manages the application tables when the backend starts, so you do not need to import a separate database dump.

**Important:** If the MySQL user already exists, `CREATE USER IF NOT EXISTS` will not update its password. Ensure that the password configured for the backend matches the existing MySQL user's password.

### 3. Configure and Run the Backend

From the repository root, run:

```bash
cd backend
python setup_local.py
```

On Linux/macOS, use `python3 setup_local.py` if necessary.

Follow the prompts to configure your owner email, owner password, and MySQL user password. The setup script creates `backend/.env` and preserves the file if it already exists.

The generated `.env` file is ignored by Git. **Never commit or share this file or its secrets.**

Start the backend from the same `backend` directory:

```bash
python run_local.py
```

On Linux/macOS, use `python3 run_local.py` if necessary.

The backend API runs at **http://localhost:8080**.

Alternatively, copy `backend/.env.example` to `backend/.env` and configure the required variables manually:

```dotenv
DB_URL=jdbc:mysql://localhost:3306/electrohub?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
DB_USERNAME=electrohub
DB_PASSWORD=your_mysql_user_password
ADMIN_EMAIL=you@example.com
ADMIN_PASSWORD=your_unique_password_at_least_12_characters
```

The owner account is created during the first startup. Changing `ADMIN_PASSWORD` afterward does not reset an existing owner's password.

### 4. Configure and Run the Frontend

Open a **second terminal** in the repository root:

```bash
cd frontend
npm ci
npm run dev
```

Open the application in your browser:

**http://localhost:5173**

The Vite development proxy forwards `/api` and `/uploads` requests to the backend on port 8080. Keep both frontend and backend terminals running while testing the application.

For consistent local sessions, use `localhost` rather than switching between `localhost` and `127.0.0.1`.

## Local Accounts and Demo Data

- Sign in using the owner credentials configured in `backend/.env` to access the owner dashboard.
- Use the registration flow to create a customer account.
- The application seeds eight demo products by default for local testing.
- To skip the initial demo catalogue, set `SEED_CATALOG=false` in `backend/.env` before the first startup.

Replace demo product descriptions, prices, and images with accurate information before using the application for real sales.

## Optional Integrations

### Razorpay Payments

To test payment functionality, configure your own Razorpay **test-mode** credentials in `backend/.env`:

```dotenv
RAZORPAY_KEY_ID=your_test_key_id
RAZORPAY_KEY_SECRET=your_test_key_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
```

Restart the backend after changing environment variables. Local webhook testing requires a public HTTPS tunnel and an appropriately configured webhook in your Razorpay dashboard.

Official resources:
- [Razorpay Standard Checkout documentation](https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/integration-steps/)
- [Razorpay webhook validation guide](https://razorpay.com/docs/webhooks/validate-test/)

Keep payment secrets on the backend only. Use test mode until the integration has been verified.

### Email, OTP, and Remote Image Storage

Optional configuration for Amazon SES SMTP, MSG91 OTP, and Cloudflare R2 is available in `backend/.env.example`.

These integrations require your own provider accounts and credentials. Refer to `docs/PRODUCTION-INTEGRATIONS.md` before enabling them.

## Validation and Testing

Run the commands from the appropriate directories.

### Frontend

From `frontend/`:

```bash
npm run build
npm run lint
npm test
```

### Backend

From `backend/`:

```bash
mvn test
mvn package
```

These commands are provided for local validation. Actual results depend on your installed tools, configuration, and test environment.

For additional details, see `docs/VALIDATION.md`.

## Troubleshooting

| Problem | Suggested solution |
|---|---|
| MySQL access denied | Verify that `DB_PASSWORD` matches the password for the `electrohub` database user. |
| Backend cannot connect to MySQL | Confirm that MySQL is running and listening on port 3306. |
| Java or Maven version error | Run `mvn -version` and verify that Maven uses Java 17 or newer. |
| Port already in use | Stop the conflicting process using port 8080 or 5173. |
| Payment setup is incomplete | Configure valid Razorpay test credentials and restart the backend. |
| Image upload fails | Sign in as the owner and verify that the image format and size meet the configured limits. |
| Frontend changes are not visible | Run the frontend commands from `frontend/` and refresh the browser. |

## Security and Production Considerations

- Never commit `backend/.env`, passwords, API secrets, or live payment credentials.
- Keep `COOKIE_SECURE=false` only for local HTTP development. Configure HTTPS and `COOKIE_SECURE=true` in production.
- Production deployment requires secure hosting, persistent image storage, database backups, and accurate store policies and contact details.
- Configure and verify third-party integrations before enabling them in production.
- This project does not migrate users, products, or orders from a previous MongoDB or Supabase database.

## Documentation

- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — application architecture and dependency flow.
- [`docs/VALIDATION.md`](docs/VALIDATION.md) — validation instructions and manual checks.
- [`docs/PRODUCTION-INTEGRATIONS.md`](docs/PRODUCTION-INTEGRATIONS.md) — optional integrations and production configuration.

## Project

**ElectroHub** is a full-stack project demonstrating frontend development, backend engineering, database integration, and e-commerce application workflows.

Repository: [github.com/Akash2775/Electrohub](https://github.com/Akash2775/Electrohub)
