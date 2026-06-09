# **🧩 @repo/shared-types**

The central type system registry and data contract boundary for the **shopnow** microservices monorepo.

This package acts as the single source of truth for all cross-service communication. It is configured as a **pure ECMAScript Module (ESM)** and utilizes **Subpath Exports** to enforce strict Domain-Driven Design (DDD). This architecture allows individual microservices to import only the exact domain contracts they need, preventing bundle bloat and tightly coupling bounded contexts.

## **🏗️ Package Anatomy & Domain Contexts**

Types and validation schemas (e.g., Zod) are isolated into specific bounded contexts matching our backend services:

@repo/shared-types/  
├── src/  
│   ├── common/             \# Global utilities (Pagination interfaces, HTTP Errors, generic DTOs)  
│   ├── catalog-service/    \# Domain contracts for Products, Categories, and Inventory  
│   └── user-service/       \# Domain contracts for Users, Authentication, and Profiles  
├── package.json            \# Defines the workspace configuration and subpath export maps  
└── tsconfig.json           \# Inherits strict compilation rules from @repo/tsconfig-config

## **🚀 Installation & Usage**

### **1\. Register as a Workspace Dependency**

To consume these types in a new or existing microservice, add the package to the target service's package.json (e.g., inside apps/user-service/package.json):

"dependencies": {  
  "@repo/shared-types": "workspace:\*"  
}

### **2\. Consume via Subpath Exports**

Thanks to the package's robust export map, you **do not** need to import from the root directory. Target the specific domain directly to keep your microservice lean:

**Importing User specific schemas (e.g., inside user-service controllers):**

import { UserSchema, UserDto } from '@repo/shared-types/user-service';

**Importing Catalog specific schemas (e.g., inside catalog-service handlers):**

import { ProductDto } from '@repo/shared-types/catalog-service';

**Importing Common utilities (usable anywhere):**

import { ApiErrorResponse } from '@repo/shared-types/common';

## **🛠️ Development Commands**

This package includes built-in commands to ensure maximum type safety and validation before CI/CD changesets are compiled:

| Command | Action | Description |
| :---- | :---- | :---- |
| pnpm build | tsc \-p tsconfig.json | Compiles the TypeScript definitions into standard declaration files. |
| pnpm lint | tsc \-p tsconfig.json \--noEmit | Runs a dry type-check to catch structural errors across the codebase without generating output files. |
| pnpm test | vitest run | Executes isolated unit tests (ideal for asserting complex Zod schema validation boundaries). |

## **🌟 Architectural Advantages**

* **Domain Isolation**: Subpath exports (@repo/shared-types/catalog-service) prevent unrelated domain logic from leaking across bounded contexts.  
* **End-to-End Type Safety**: Eliminates data contract discrepancies when microservices interact over the network. If user-service alters a payload structure, catalog-service will instantly flag a compilation error during the monorepo build loop if it breaks compatibility.  
* **Zero Boilerplate**: Prevents the dangerous practice of copy-pasting the exact same data interfaces or validation logic across individual codebases, completely avoiding synchronization slip-ups in production.