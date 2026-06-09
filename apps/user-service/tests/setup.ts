import { beforeAll, beforeEach, afterAll, vi } from "vitest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import crypto from "crypto";
import fs from "fs";
import path from "path";

let mongoServer: MongoMemoryServer;
const certsDir = path.join(__dirname, "../certs");
const privateKeyPath = path.join(certsDir, "private.pem");
const publicKeyPath = path.join(certsDir, "public.pem");

beforeAll(async () => {
  // 1. Asymmetric Cryptography Test Isolation Setup
  // Automatically provision mock RS256 keys so tokenService can run in headless execution pools
  if (!fs.existsSync(certsDir)) {
    fs.mkdirSync(certsDir, { recursive: true });
  }

  if (!fs.existsSync(privateKeyPath) || !fs.existsSync(publicKeyPath)) {
    const { privateKey, publicKey } = crypto.generateKeyPairSync("rsa", {
      modulusLength: 2048,
      publicKeyEncoding: { type: "pkcs1", format: "pem" },
      privateKeyEncoding: { type: "pkcs1", format: "pem" },
    });

    fs.writeFileSync(privateKeyPath, privateKey);
    fs.writeFileSync(publicKeyPath, publicKey);
  }

  // 2. Safe database guardrail
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }

  // Spawn an isolated, ephemeral in-memory MongoDB instance
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri, { autoIndex: false });
}, 120000);

beforeEach(async () => {
  const collections = mongoose.connection.collections;
  await Promise.all(
    Object.values(collections).map((collection) => collection.deleteMany({})),
  );

  vi.clearAllMocks();
});

afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }

  // Clean up transient keys to ensure workspace purity
  try {
    if (fs.existsSync(privateKeyPath)) fs.unlinkSync(privateKeyPath);
    if (fs.existsSync(publicKeyPath)) fs.unlinkSync(publicKeyPath);
  } catch (err) {
    // Fail silently during parallelized runner tear downs
  }
});
