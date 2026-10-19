# Validation performed

Prepared 2 October 2026 after the folder-structure refactor.

| Check | Result |
|---|---|
| React JavaScript/JSX Vite production build | Passed |
| ESLint | Passed |
| Frontend Vitest suite | 5 passed |
| Frontend TypeScript removed from source/build configuration | Passed |
| Layer/import audit: controllers contain no direct repository/SQL access | Passed |
| Layer/import audit: direct `JdbcTemplate` usage is confined to `repository/jdbc` | Passed |
| Java core source compile check using local dependency stubs | Passed |
| Maven/Spring Boot full backend build in this editing environment | Not run — Maven is not installed here |

## Run full validation on your machine

Frontend:

```bash
cd frontend
npm ci
npm run build
npm run lint
npm test
```

Backend:

```bash
cd backend
mvn clean test
mvn clean package
```

If your existing MySQL database reports a Flyway checksum mismatch for migration V4, repair/reconcile that existing migration history before starting this refactored backend. Do not delete production data only to clear a checksum mismatch.
