# UI Architecture

The UI uses a feature-first structure with TanStack Router + TanStack Query.

## Current Directory Layout

```txt
src/
  app/
    config/         # env parsing/helpers
    providers/      # global providers
  components/
    layouts/        # app shell/layout components
  features/
    admin/
      api/
      components/
      model/
    employees/
      mutations/
      queries/
    profile/
    provisioning/
      api/
  lib/              # shared infra (http, auth, errors)
  routes/           # route files and route-level guards
  server/           # server-only auth/session utilities
  styles/
```

## Layering Rules

1. Routes handle navigation and access control (`beforeLoad` guards).
2. Feature APIs own endpoint calls.
3. Query/mutation hooks own server-state orchestration.
4. Components focus on rendering and event wiring.
5. Shared infra stays in `src/lib` and `src/server`.

## Data Fetching Rules

- Do not call `fetch` directly inside route/components.
- Use feature APIs and query hooks.
- Validate API responses at boundaries (Zod/contracts).
- Use query key namespaces per feature.

## Environment

- `VITE_API_URL`: browser API base URL
- `API_URL`: SSR/server-function API base URL

See `apps/ui/.env.example`.
