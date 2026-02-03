# HRIS-v2 Developer Onboarding Guide

Welcome to the HRIS-v2 project! This document serves as a comprehensive guide to help you get started with development.

---

## 🚀 Project Overview

**HRIS-v2** (Human Resource Information System) is a modern, high-performance backend solution designed to manage employee data, authentication, and background organizational tasks. It is built as a **Turborepo monorepo**, ensuring a clean separation between API contracts, server logic, and shared utilities.

---

## 🛠 Tech Stack

- **Monorepo**: [Turborepo](https://turbo.build/) & [pnpm](https://pnpm.io/)
- **Web Framework**: [Hono](https://hono.dev/) with `zod-openapi` for type-safe contracts
- **Database**: [PostgreSQL](https://www.postgresql.org/) with [Drizzle ORM](https://orm.drizzle.team/)
- **Authentication**: [BetterAuth](https://www.better-auth.com/)
- **Queue/Cache**: [Redis](https://redis.io/) & [BullMQ](https://docs.bullmq.io/)
- **Logging**: [Pino](https://getpino.io/)
- **Testing**: [Vitest](https://vitest.dev/)
- **Linting/Formatting**: [Biome](https://biomejs.dev/)
- **Local Proxy**: [Caddy](https://caddyserver.com/)

---

## ⚙️ Setup Instructions

### 1. Prerequisites
Ensure you have the following installed:
- Node.js (>= 18)
- pnpm
- Docker & Docker Compose
- Caddy

### 2. Installation
Clone the repository and install dependencies:
```bash
pnpm install
```

### 3. Environment Variables
Copy the example environment file and fill in required values:
```bash
cp .env.example .env
```

### 4. Initialization
Run the setup command to start databases and check dependencies:
```bash
make setup
```

### 5. Database Migrations
Generate and run migrations to set up your schema:
```bash
make migrate
```

### 6. Run Locally
Start the development environment (Caddy and Server):
```bash
make dev
```
The API should now be accessible at `https://api.hris.localhost`.

---

## 📂 Project Structure

```text
├── apps
│   ├── api             # Main Hono backend service
│   │   ├── src/v1      # API Version 1 endpoints
│   │   ├── src/lib     # Core infrastructure (Auth, DB, Redis)
│   │   ├── src/services# Business logic layer
│   │   └── src/repos   # Data access layer (Drizzle queries)
│   └── ui              # Frontend application (React/Next.js)
├── packages
│   └── api-routes      # Shared Zod schemas and API contracts
├── .devcontainer       # Docker Compose configs
└── Makefile            # Task automation
```

---

## 📜 Makefile Commands

Use `make <command>` for common tasks:

| Command | Description |
|---------|-------------|
| `setup` | Runs dependency checks and starts Docker containers |
| `dev` | Runs all apps in development mode with Caddy |
| `stop` | Stops all running Docker containers |
| `migrate` | Generates and applies Drizzle migrations |
| `studio` | Launches Drizzle Kit Studio to view DB data |
| `api-docs` | Opens the local Swagger UI Documentation |
| `seed` | Feeds the database with initial development data |

---

## 🛣 How to Create a New Feature (API Route)

We follow a strict **Contract-First** and **Layered Architecture** approach.

### 1. Define the Contract (Shared Package)
Define your Zod schemas in `packages/api-routes/src/[module]/[feature].ts`. This ensures both frontend and backend use the same types.
```typescript
export const CreateFeatureSchema = z.object({ name: z.string() });
export const FeatureResponse = z.object({ status: z.literal("success"), data: z.object({ id: z.string() }) });
```

### 2. Implement the Repository (Data Access)
Create a new file in `apps/api/src/repositories/[module]/[module].[feature].ts`. Use Drizzle ORM for database queries.
```typescript
export const createItem = async (data: NewItem) => {
  return db.insert(items).values(data).returning();
};
```
*Barrel export your actions in `repositories/[module]/index.ts`.*

### 3. Implement the Service (Business Logic)
Create a new file in `apps/api/src/services/[module]/[module].[feature].ts`. This layer handles orchestration, external calls, and domain-specific errors.
```typescript
export const createItem = async (payload: Payload) => {
  // Logic, validation, worker triggers, etc.
  const result = await itemRepository.createItem(payload);
  return { success: true, data: result };
};
```
*Barrel export your services in `services/[module]/index.ts`.*

### 4. Create the API Route (Controller)
In `apps/api/src/v1/[module]/[action].ts`, implement the Hono/OpenAPI route:
```typescript
export function createItemRoute(app: App, router: OpenAPIHono) {
  router.openapi(routeSpec, async (c) => {
    const body = c.req.valid('json');
    const result = await itemService.createItem(body);
    return c.json({ status: "success", data: result.data }, 201);
  });
}
```

### 5. Register the Route
Add the route handler to the module's route index (`src/v1/[module]/index.ts`) and ensure the module is registered in the main `src/v1/index.ts`.

---

## ⚖️ Best Practices & Conventions

- **Fail Fast**: All environment variables are validated via Zod in `src/constants/env.ts` at startup.
- **Layered Architecture**: Keep HTTP logic in **Routes**, orchestration in **Services**, and raw DB queries in **Repositories**.
- **Type Safety**: Never use `any`. Rely on Zod schema inference for request/response types.
- **Graceful Shutdown**: All infrastructure services (Redis, PG, Workers) must be registered in the service registry for orderly cleanup.
- **Logging**: Use `logger.info` for major events and `logger.debug` for detailed request/flow data.


