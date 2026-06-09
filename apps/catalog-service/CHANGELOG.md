# @repo/catalog-service

## 0.1.0

### Minor Changes

- c363d28: # Catalog Service Types & Workspace Infrastructure Updates

  ### @repo/shared-types (Minor)

  - Implemented and exported comprehensive network, payload, and response type contracts for the Catalog Service mapping to `Product` and `Association` models.
  - Added automated type-level integration test suites under `tests/catalog-type.test.ts` to enforce validation compile-time safety rules.

  ### @repo/user-service (Patch)

  - Updated internal asset filename mappings inside the production multi-stage `Dockerfile` to prevent image compilation cache drops.
  - Fixed asymmetric cryptographic verification overhead in headless test execution environments by integrating automated runtime RS256 keypair generation into the integration test harness.
  - Removing outputting physical production artifacts while turborepo test type checking for compiled errors using vitest.

  ### Ecosystem

  - Introduced an explicit `.env.sample` file to standardize local workspace environment hydration for developers.

### Patch Changes

- Updated dependencies [c363d28]
  - @repo/shared-types@0.2.0
