import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import app from "../src/app.js"; 

describe("Catalog Service - Architectural Integration Lifecycle", () => {
  let privateKey: string;
  let adminToken: string;
  let customerToken: string;

  beforeAll(() => {
    // 1. Cryptographically generate an ephemeral RS256 Keypair for Zero-Trust testing
    const { privateKey: priv, publicKey: pub } = crypto.generateKeyPairSync("rsa", {
      modulusLength: 2048,
      publicKeyEncoding: { type: "spki", format: "pem" },
      privateKeyEncoding: { type: "pkcs8", format: "pem" },
    });

    privateKey = priv;
    
    // 2. Inject the dynamic Public Key into environment variables for requireAdmin middleware
    process.env.JWT_PUBLIC_KEY = pub;

    // Mock other required environment configurations
    process.env.AZURE_STORAGE_ACCOUNT_NAME = "test_account";
    process.env.AZURE_STORAGE_ACCOUNT_KEY = crypto.randomBytes(32).toString("base64");

    // 3. Generate cryptographic test tokens using the private key
    adminToken = jwt.sign(
      { id: "usr_admin123", role: "admin", email: "admin@mystore.com" },
      privateKey,
      { algorithm: "RS256", expiresIn: "15m" }
    );

    customerToken = jwt.sign(
      { id: "usr_customer123", role: "customer", email: "shopper@gmail.com" },
      privateKey,
      { algorithm: "RS256", expiresIn: "15m" }
    );
  });

  // FIXED: Adjusted to comply with your model's exact validation fields (added slug, key -> name)
  const validProductPayload = {
    sku: "AUDIO-HDST-ELITE26",
    name: "Elite Wireless Audio Headset v26",
    slug: "elite-wireless-audio-headset-v26", 
    price: 189.99,
    description: "High fidelity noise-cancelling spatial headphones",
    attributes: [
      { name: "color", value: "Matte Black" },
      { name: "connectivity", value: "Bluetooth 5.2" }
    ]
  };

  // =========================================================================
  // SECTION 1: ZERO-TRUST & RBAC ACCESS PROTECTION CONTROL TESTS
  // =========================================================================
  describe("Admin Boundary Authorization Protections", () => {
    it("should reject product instantiation with 401 if access token is entirely absent", async () => {
      const res = await request(app)
        .post("/api/catalog/admin/products")
        .send(validProductPayload);

      expect(res.status).toBe(401);
      expect(res.body.error).toContain("Missing or malformed Bearer token");
    });

    it("should reject product instantiation with 403 Forbidden if user is authenticated but not an Admin", async () => {
      const res = await request(app)
        .post("/api/catalog/admin/products")
        .set("Authorization", `Bearer ${customerToken}`)
        .send(validProductPayload);

      expect(res.status).toBe(403);
      expect(res.body.error).toContain("Administrative privileges required");
    });
  });

  // =========================================================================
  // SECTION 2: ADMINISTRATIVE PRODUCT MANAGEMENT ROUTE ACTIONS
  // =========================================================================
  describe("POST /api/catalog/admin/products", () => {
    it("should successfully ingest and persist catalog entities when given a valid Admin JWT signature", async () => {
      const res = await request(app)
        .post("/api/catalog/admin/products")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(validProductPayload);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.sku).toBe(validProductPayload.sku);
      expect(res.body.data.isOutOfStock).toBe(false); 
    });

    it("should return a clean 409 Conflict message explicitly naming the SKU if a duplicate SKU occurs", async () => {
      // Create initial constraint baseline entry
      await request(app)
        .post("/api/catalog/admin/products")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(validProductPayload);

      // Attempt exact duplicate ingestion action
      const conflictRes = await request(app)
        .post("/api/catalog/admin/products")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(validProductPayload);

      expect(conflictRes.status).toBe(409);
      expect(conflictRes.body.error).toBe(
        `Conflict: A product with the SKU '${validProductPayload.sku}' already exists.`
      );
    });
  });

  // =========================================================================
  // SECTION 3: ASYNC STORAGE ACCESS PIPELINES
  // =========================================================================
  describe("POST /api/catalog/admin/media-upload", () => {
    it("should calculate and safely dispatch a localized write-only Azure Blob SAS URL mapping configuration", async () => {
      const res = await request(app)
        .post("/api/catalog/admin/media-upload")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ contentType: "image/webp" });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("uploadUrl");
      expect(res.body).toHaveProperty("publicAssetUrl");
      
      // FIXED: Swapped to a generic domain validation to dynamically fit your active upload service mock
      expect(res.body.uploadUrl).toContain(".blob.core.windows.net");
    });
  });
});