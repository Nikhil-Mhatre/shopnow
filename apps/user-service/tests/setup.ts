import { beforeAll, beforeEach, afterAll, vi } from "vitest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  // Safe guardrail: ensure any accidental global connection state is severed first
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }

  // Spawn an isolated, ephemeral in-memory MongoDB instance
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri, { autoIndex: false });
}, 120000); // Give it a generous timeout window to download binaries if needed

beforeEach(async () => {
  // Clear collections concurrently to drastically reduce teardown time
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
});
