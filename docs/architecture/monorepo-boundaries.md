# Monorepo Boundaries

This document defines ownership and layering boundaries to keep the codebase scalable and easy to navigate.

## Package Responsibilities

### packages/contracts
- API boundary definitions only.
- DTOs, validation schemas, enums, and shared error payload schemas.
- No runtime helpers, no framework-specific code, and no access to app code.

### apps/api
- Transport layer (routes), service/domain logic, repositories, persistence, and infrastructure.
- Maps contract payloads to service commands and service results to contract responses.
- Owns response factories and OpenAPI route helpers.

### apps/ui
- Presentation and feature orchestration.
- UI components, feature-level model logic, data-fetching hooks, and view models.
- No direct imports from apps/api implementation.

### packages/utils
- Pure, framework-agnostic helpers.
- No app-specific logic, no DB access, no network calls.

## Dependency Rules

1. `packages/contracts` is a boundary layer and must not import from apps or framework-specific packages.
2. `apps/api` can import contracts for validation schemas and DTOs.
3. `apps/ui` can import contracts for client-side schema validation and typing.
4. `apps/ui` must not import any `apps/api` implementation.
5. `apps/api` should not import `packages/contracts` root; use subpaths like `@hris-v2/contracts/me` or `@hris-v2/contracts/errors`.

## Examples

- Route mapping (API):
  - Parse request with `@hris-v2/contracts/me` schema
  - Map to `UpdateOwnProfileCommand`
  - Call service
  - Map result to contract response

- UI form validation:
  - Compose UI rules from contract field schemas
  - Add UX-only constraints (empty-string normalization, field-level copy)

## Enforcement

- `biome.json` restricts cross-layer imports using `noRestrictedImports`.
