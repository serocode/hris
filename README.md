# HRIS v2

Monorepo for the HRIS API and UI, built with pnpm workspaces and Turborepo.

## Stack

- API: Hono, Drizzle ORM, Better Auth, PostgreSQL, Redis, BullMQ
- UI: TanStack Start (React), Vite, Tailwind CSS
- Tooling: TypeScript, Biome, Vitest, Husky, Docker

## Repository Layout

```text
apps/
  api/          API service
  ui/           Web app
packages/
  api-routes/   Shared Zod contracts and response helpers
  tsconfig/     Shared TypeScript presets
```

## Prerequisites

- Node.js 22+
- pnpm 10+
- Docker + Docker Compose
- Caddy (for local TLS routing with `hris.localhost`)

## Environment Setup

1. Copy the root env file:

```bash
cp .env.example .env
```

2. (Optional) Copy UI env file for local UI-only workflows:

```bash
cp apps/ui/.env.example apps/ui/.env
```

## Local Development

Install dependencies:

```bash
pnpm install
```

Start local infra (Postgres, Redis, Mailpit):

```bash
make api_db
```

Run migrations:

```bash
pnpm --filter @hris-v2/api migrate
```

Run API + UI in dev mode:

```bash
pnpm dev
```

## Quality Gates

Run all checks before merging:

```bash
pnpm lint
pnpm check-types
pnpm --filter @hris-v2/api test
pnpm turbo run build
```

## Production (Docker Compose)

Build and run:

```bash
docker compose -f docker-compose.production.yml up --build
```

Services:

- API: `http://localhost:${API_PORT:-3333}`
- UI: `http://localhost:${UI_PORT:-3000}`

## Environment Variables

Root `.env` drives API, UI build/runtime, and compose values.

Required for production:

- `BETTER_AUTH_SECRET` (strong random 32+ chars)
- `BETTER_AUTH_URL` (HTTPS URL)
- `POSTGRES_*`
- `REDIS_PASSWORD` (strong)
- `ALLOWED_ORIGINS`
- `VITE_API_URL` (browser API base)
- `API_URL` (server-side UI API base)

Use `.env.example` as the canonical reference.
