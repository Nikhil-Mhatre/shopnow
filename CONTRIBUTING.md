# **🤝 Contributing to shopnow**

Welcome to the **shopnow** ecosystem\! We are thrilled that you want to help build our decoupled microservices architecture.

Because this repository is a public monorepo utilizing strict type safety and automated deployment sequences, we require all contributors to follow the workflow guidelines detailed below.

## **🛡️ Git Branching Model**

1. **Do not attempt to push directly to main.** The main branch is highly protected. All direct pushes are blocked by automated guardrails.  
2. Create a targeted feature branch from the latest upstream main code:  
   git checkout \-b feat/your-feature-name  
   \# or  
   git checkout \-b fix/your-bugfix-name

## **📦 The Code Lifecycle & Tooling**

We use a high-performance orchestration layer powered by **pnpm Workspaces** and **Turborepo**. Before proposing a pull request, you must ensure your code builds and passes validation locally.

### **Key Development Commands**

* **Install Dependencies**: pnpm install (Never use npm or yarn).  
* **Run Local Dev Servers**: pnpm dev  
* **Validate Everything**: pnpm turbo run lint test build

Your code must achieve a successful status across all workspaces in the Turborepo execution matrix before you request a review.

## **🚀 The Release Engine: Creating Changesets**

We implement an industry-grade automated versioning strategy via **Changesets**. Every functional modification, dependency updates, or bug fix **MUST** be accompanied by a small markdown changeset artifact.

### **How to document your changes:**

Before staging your work, execute the following command at the root of the repository:

pnpm changeset

1. **Select Packages**: Use the arrow keys and Spacebar to select which microservices or shared packages your changes impacted (e.g., user-service, @repo/shared-types).  
2. **Choose Bump Type**: Select whether your change is a major (breaking), minor (feature addition), or patch (bug fix/chore).  
3. **Write a Human Summary**: Type a concise, professional summary explaining what changed. Avoid noisy descriptions like "fixed bug" or "wip".

Commit the resulting .changeset/some-random-words.md file **directly alongside your application code changes** in the same commit.

## **📝 Pull Request Checklist**

When submitting a Pull Request (PR) to main, ensure you complete these baseline validations:

* \[ \] My code successfully passes pnpm turbo run lint test build locally.  
* \[ \] I have generated a local changeset file via pnpm changeset (if making functional modifications).  
* \[ \] My commit messages loosely conform to Conventional Commit definitions (e.g., feat(catalog): add product search endpoint).

Once submitted, our Continuous Integration (CI) pipeline will independently verify your code stability. An administrator will review your structural contributions and merge them when ready\!