# API Service (`@hris-v2/api`)

Hono-based API service for HRIS.

## Scripts

```bash
pnpm --filter @hris-v2/api dev
pnpm --filter @hris-v2/api build
pnpm --filter @hris-v2/api start
pnpm --filter @hris-v2/api test
pnpm --filter @hris-v2/api migrate
```

## Build Output

Production build emits runnable files to:

- `apps/api/dist/index.js`
- `apps/api/dist/migrate.js`

## Runtime Dependencies

- PostgreSQL
- Redis
- Better Auth secret and base URL

## Architecture & Behavior Notes

### Rate Limiter Fail-Open Behavior
The API incorporates a Redis-backed rate limiting middleware. If the Redis connection fails or times out, the rate limiter is designed to "fail-open" by default. This ensures that application traffic continues uninterrupted even if the Redis server goes down unexpectedly, prioritizing availability and uptime for critical API endpoints.

### Error Handler Stack Trace Behavior
The global error handler dynamically handles stack traces depending on the current environment:
- **Development/Test**: Stack traces are fully exposed in the JSON response payload (`error.stack`) to allow engineering and QA to debug errors rapidly.
- **Production**: Stack traces are **redacted** directly from the JSON responses globally to prevent data exposure or leaking implementation details. However, full stack traces are still captured and recorded in standard server logs for production monitoring.

All env keys are documented in the workspace root `.env.example`.
