---
"@repo/shared-types": minor
"@repo/catalog-service": minor
"@repo/user-service": patch
---

# Catalog Service Types & Workspace Infrastructure Updates

### @repo/shared-types (Minor)

- Implemented and exported comprehensive network, payload, and response type contracts for the Catalog Service mapping to `Product` and `Association` models.
- Added automated type-level integration test suites under `tests/catalog-type.test.ts` to enforce validation compile-time safety rules.

### @repo/user-service (Patch)

- Updated internal asset filename mappings inside the production multi-stage `Dockerfile` to prevent image compilation cache drops.
- Fixed asymmetric cryptographic verification overhead in headless test execution environments by integrating automated runtime RS256 keypair generation into the integration test harness.
- Removing outputting physical production artifacts while turborepo test type checking for compiled errors using vitest.

### Ecosystem

- Introduced an explicit `.env.sample` file to standardize local workspace environment hydration for developers.
