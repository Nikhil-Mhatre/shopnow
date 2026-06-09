import { beforeAll, beforeEach, afterAll, vi } from "vitest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

let mongoServer: MongoMemoryServer;

// 1. Mock 'amqplib' globally so Catalog's background listeners do not attempt
// to connect to a real RabbitMQ network cluster during testing.
vi.mock("amqplib", () => {
  const mockChannel = {
    assertExchange: vi.fn().mockResolvedValue({}),
    assertQueue: vi.fn().mockResolvedValue({}),
    bindQueue: vi.fn().mockResolvedValue({}),
    consume: vi.fn().mockResolvedValue({}),
    ack: vi.fn(),
  };

  const mockConnection = {
    createChannel: vi.fn().mockResolvedValue(mockChannel),
    close: vi.fn().mockResolvedValue(undefined),
  };

  return {
    default: {
      connect: vi.fn().mockResolvedValue(mockConnection),
    },
  };
});

beforeAll(async () => {
  // Ensure clear boundary states
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }

  // 2. Spawn ephemeral MongoDB instance
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
}, 120000);

beforeEach(async () => {
  // Concurrent data cleanup between isolation cycles
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
