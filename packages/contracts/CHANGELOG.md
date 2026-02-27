# Changelog

All notable changes to this package will be documented in this file.

## [1.1.0] - 2026-02-25

### Added
- Shared `EmployeeData` base schema in `_base.ts` — single source of truth for employee response shape
- `dateOfBirth` field now included in all employee response schemas

### Changed
- **BREAKING**: Response date fields (`dateOfBirth`, `hireDate`, `createdAt`, `updatedAt`) are now `z.string()` instead of `z.coerce.date()`. This matches what JSON actually sends (ISO strings), fixing frontend type mismatches.
- **BREAKING**: All employee response schemas now consistently include `createdAt` and `updatedAt` (previously missing from create and update responses).
- `EmployeesCreateResponse.data.id` is now required (was incorrectly `optional`).
- Removed `.min(2)` constraints from response schemas (moved to payload-only).

### Removed
- Duplicated `EmployeesResponseData` schemas (was copy-pasted across 5 files).
- `position` field removed from API responses (never existed in the database schema).

## [1.0.0] - Initial Release

Initial contract definitions for employees, profile (`/me`), error schemas, and file validation.
