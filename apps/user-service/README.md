# **👤 User Service**

The **User Service** is an enterprise-grade, high-performance Node.js microservice written in TypeScript. It is responsible for customer identity context, authentication lifecycle via passwordless OTP (One-Time Password) validation, and profile management inside the shopnow e-commerce monorepo.

Following a strict **"Code as Truth"** philosophy, this service serves its own interactive API documentation compiled dynamically from its Zod validation schemas and implements highly isolated integration tests with an in-memory database.

## **🛠️ Key Architectural Highlights**

* **Decoupled Architecture**: Separates Express initialization (src/app.ts) from server network listeners (src/index.ts) for friction-free, port-independent integration testing.  
* **Asymmetric Encryption (RS256)**: Signs tokens with a private RSA key and validates signatures with a public key.  
* **Dual-Path Security Middleware**: Automatically parses identity contexts injected by **Envoy Gateway** while maintaining a local fallback JWT decoder for convenient developer workflows.  
* **Observability Layer**: Integrates **Winston** structured logging and **Morgan** HTTP middleware, formatting logs into readable outputs for local development while streaming structural JSON strings to stdout in production.

## **📋 Prerequisites**

Before running the service, ensure you have the following installed on your machine:

| Prerequisite | Recommended Version | Purpose |
| :---- | :---- | :---- |
| **Node.js** | v20.x or v22.x (LTS) | Runtime Engine (supports native \--env-file feature) |
| **pnpm** | v9.x+ | Extremely fast disk-space efficient Monorepo Package Manager |
| **Docker & Compose** | Desktop Latest | Local container orchestrator (MongoDB, Mailpit, Envoy Gateway) |
| **OpenSSL** | Built-in (Mac/Linux) or Git Bash (Windows) | Generating local asymmetric RS256 certificates |

## **🔑 1\. Local Certificates Setup**

The authentication process relies on RS256 asymmetric signing. You must generate a matching pair of private.pem and public.pem certificates locally.

Run the following commands inside the root directory of your user-service package (apps/user-service):

\# Create the secure certs directory  
mkdir \-p certs

\# Generate an RSA private key (2048-bit)  
openssl genrsa \-out certs/private.pem 2048

\# Extract the public key from the private key  
openssl rsa \-in certs/private.pem \-pubout \-out certs/public.pem

**Security Note:** The certs/ directory is explicitly excluded from version control via .gitignore. Never commit these PEM files to public source repositories.

## **⚙️ 2\. Environment Variables Configuration**

Create a .env file at the root of the User Service workspace (apps/user-service/.env):

NODE\_ENV=development  
PORT=3001  
MONGO\_URI=mongodb://localhost:27017/ecommerce-users  
JWT\_SECRET=your\_fallback\_symmetric\_secret\_here

\# Mail Configuration  
SMTP\_HOST=localhost  
SMTP\_PORT=1025

## **🚀 3\. Running in the Development Environment**

Since this package is nested inside a **pnpm monorepo**, you should link workspace packages and build shared schemas before running the server.

### **Step 3.1: Install & Link Workspace Packages**

From the **root of your monorepo** (C:/nikhil/shopnow), run:

\# Link all workspaces and pull dependencies  
pnpm install

\# Compile shared libraries (e.g., @repo/shared-types, @repo/tsconfig-config)  
pnpm build

### **Step 3.2: Spin up local Infrastructure**

Before booting the application, start MongoDB and your Mailpit inbox using Docker Compose at the monorepo root:

docker compose up \-d mongodb mailpit

### **Step 3.3: Boot the Service**

To start the microservice in watch mode (hot reload enabled), target the workspace filter:

pnpm \--filter user-service dev

## **🧪 4\. Testing Strategy (Integration Focus)**

This microservice uses **Vitest** coupled with **Supertest** for port-free HTTP assertions, along with **MongoDB Memory Server** for data isolation.

To run the localized integration suite:

pnpm \--filter user-service test

### **What happens during a test run?**

1. An ephemeral, in-memory MongoDB daemon starts dynamically.  
2. A supertest agent sends raw payloads against your Express routing configurations.  
3. A Spied mailService interceptor extracts the 6-digit verification code mid-flight and feeds it directly into your verification endpoints to validate end-to-end flows.  
4. The database state is cleared, and the memory server shuts down cleanly, ensuring your physical development database remains untouched.

## **📖 5\. API Documentation ("Code as Truth")**

Swagger documentation is dynamically compiled from your runtime Zod schemas using @asteasolutions/zod-to-openapi. This prevents your API blueprints from drifting from your actual codebase.

### **Viewing the Docs**

1. Make sure your service is running (pnpm \--filter user-service dev).  
2. Open your browser and navigate to: **http://localhost:3001/api-docs**  
3. You can also inspect the raw JSON spec file at: **http://localhost:3001/api-docs/swagger.json**

## **🐳 6\. Running with Docker Compose & Envoy Gateway**

To simulate a complete cloud deployment environment on your local machine, you can run your Dockerfile and API gateway.

### **Build and Run the Complete Stack**

From the monorepo root, run:

docker compose up \-d \--build

### **Infrastructure Port Mapping:**

* **http://localhost:8080**: **Envoy API Gateway** (All client API requests should hit this port\!).  
* **http://localhost:8025**: **Mailpit Web UI** (Review OTP dispatched emails).  
* **http://localhost:3001**: Raw User Service container.  
* **http://localhost:27017**: Active MongoDB cluster.

### **Gateway Verification Test:**

Run a POST request to http://localhost:8080/api/auth/otp-request in Postman. Envoy will intercept the request, inspect its path prefixes, and route it to your isolated container seamlessly\!

## **📮 7\. API Testing with Postman**

We have included a fully configured Postman collection to let you test all of the authentication and profile features instantly.

### **How to Import and Start Testing:**

1. **Locate the Collection**: Find the JSON collection file at apps/user-service/postman-collection.json.  
2. **Import into Postman**:  
   * Open **Postman**.  
   * Click the **Import** button in the top-left corner of the sidebar.  
   * Choose or drag-and-drop the postman-collection.json file.  
3. **Configure Environment Variables**:  
   We recommend setting up a Postman Environment with the following base variables:  
   * baseUrl : http://localhost:8080 (to route through the **Envoy API Gateway**) or http://localhost:3001 (to call the service directly).  
   * JWT\_TOKEN : Leave empty initially (it gets populated dynamically upon OTP verification).  
4. **Execution Flow**:  
   * **Step 1: Request OTP**: Fire POST /api/auth/otp-request with your email.  
   * **Step 2: Get OTP**: Visit the Mailpit dashboard at http://localhost:8025 to fetch your 6-digit numeric verification code.  
   * **Step 3: Verify OTP**: Run POST /api/auth/otp-verify supplying the code. This will automatically extract and capture the JWT access token and save it to your Postman workspace variables.  
   * **Step 4: Access Protected Profile**: Run PUT /api/profile to update user metadata. The Authorization tab is pre-configured to automatically append your active Bearer {{JWT\_TOKEN}} header\!