# @repo/shared-types

## 0.2.0

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

## 0.1.0

### Minor Changes

- 65960c1: ### Initial Foundations Baseline Release

  This changeset marks the initial architectural baseline initialization for the `shopnow` platform ecosystems, establishing zero-dependency boundaries and cross-workspace configuration management pipelines.

  #### Core Modules Registered:

  - **`user-service`**: Scaffolding baseline for the microservice identity and authentication platform framework.
  - **`@repo/tsconfig-config`**: Central compilation rules defining native strict ESM presets (ES2022 / NodeNext targeting specifications).
  - **`@repo/shared-types`**: Domain-Driven Design (DDD) layout initializing encapsulated subpath module entry points (`/user-service`, `/catalog-service`, `/common`) to host end-to-end type validations natively.

  #### Infrastructure Adjustments:

  - Formally activated automated repository version tracking and tag calculation boundaries via the Changesets engine configuration matrix.
  - Locked in global workspace layout linkages within the root repository orchestration architecture.
