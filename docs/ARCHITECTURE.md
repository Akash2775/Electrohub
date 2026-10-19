# ElectroHub architecture

## Backend

The backend follows a layered Spring Boot design. Dependencies point inward through interfaces so HTTP code and database code are not mixed.

```text
controller
   ↓
service (interfaces)
   ↓
service/impl (business rules)
   ↓
repository (interfaces)
   ↓
repository/jdbc (JdbcTemplate + SQL)
   ↓
MySQL / Flyway
```

### Packages

- `controller/` maps HTTP requests and responses and delegates work to services.
- `dto/` contains request records and Jakarta Bean Validation constraints.
- `model/` contains domain concepts such as `OrderStatus`, `UserRole` and `SupportTicketType`.
- `service/` contains abstractions used by controllers and other services.
- `service/impl/` contains business rules such as checkout, OTP, catalogue, support, reviews and admin fulfilment.
- `repository/` defines persistence contracts.
- `repository/jdbc/` is the only application package that directly uses `JdbcTemplate`.
- `integration/payment/` adapts Razorpay to the `PaymentGateway` abstraction.
- `config/` contains Spring Security configuration.
- `database/` contains catalogue/owner seed bootstrap logic.
- `exception/` provides consistent REST error responses.
- `util/` contains small shared validators and OTP formatting helpers.

This makes a future migration from JDBC to JPA, another payment provider, or another storage provider possible without changing controller contracts.

## Frontend

The frontend is React with plain JavaScript/JSX, HTML and CSS through Vite.

```text
src/
  app/                 route composition
  components/common/   reusable visual components
  context/             shared customer/cart/session state
  hooks/               reusable data-loading hooks
  pages/               route-level screens
  services/            API/fetch layer
  styles/              CSS
  tests/               Vitest tests
  utils/               formatting and shared helpers
```

Route pages import reusable components and call the API through `services/api.js`; session/cart state is held in `context/StoreContext.jsx`.
