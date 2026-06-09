# **🛠️ @repo/tsconfig-config**

A centralized, immutable TypeScript configuration package for the **shopnow** microservices monorepo.

This package eliminates boilerplate by housing standard compiler rule bundles in one location. By exporting a strict base.json preset, it enforces consistent compilation targets, module resolution, and type-checking rules across all internal applications and packages.

## **📁 Package Anatomy**

This package is intentionally minimal, exposing only the configuration files via its package.json exports mapping:

@repo/tsconfig-config/  
├── base.json             \# Core strict compilation configuration (ES2022, NodeNext)  
└── package.json          \# Package configuration declaring workspace exports

## **🚀 Installation & Usage**

### **1\. Register as a Development Dependency**

To share these configurations with a new microservice workspace or package inside the monorepo, add the reference to its local package.json:

"devDependencies": {  
  "@repo/tsconfig-config": "workspace:\*"  
}

### **2\. Extend inside your App Compilation Context**

Inside the application's root tsconfig.json (e.g., apps/user-service/tsconfig.json), extend this package directly. Thanks to the "exports": { ".": "./base.json" } mapping, you can reference it cleanly:

{  
  "extends": "@repo/tsconfig-config/base.json",  
  "compilerOptions": {  
    "outDir": "./dist"  
  },  
  "include": \["src/\*\*/\*"\],  
  "exclude": \["node\_modules", "dist"\]  
}

## **⚙️ Base Configuration Highlights**

The base.json preset is configured for modern Node.js backend development, utilizing:

* **Target & Module**: ES2022 with NodeNext module resolution for optimal native ESM support.  
* **Strict Mode**: Full strict: true enforcement to guarantee robust type safety across microservices.  
* **Declarations**: Emits .d.ts declarations and declaration maps, essential for accurate cross-package intellisense in a monorepo.  
* **Source Maps**: Enabled by default to ensure highly accurate stack traces during production debugging and error logging.  
* **Performance**: Skips library checking (skipLibCheck: true) to accelerate Turborepo build speeds.

## **🏗️ Architectural Advantages**

* **Single Source of Truth**: Updating an engine parameter or type-checking rule inside base.json instantly scales across every service in the project tree upon the next pnpm build execution.  
* **Build Optimization**: Minimizes workspace overhead and configuration drift, ensuring smooth and predictable container compilation tracks inside multi-stage Docker builds.  
* **Zero Boilerplate**: Developers spinning up new microservices don't need to guess which TypeScript rules to apply; they simply extend the base and start coding.