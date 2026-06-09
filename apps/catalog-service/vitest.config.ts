import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Enable global assertions if needed (like describe, it, expect without importing)
    globals: true,
    // Point cleanly to your database lifecycle initialization hooks
    setupFiles: ["./tests/setup.ts"],
    environment: "node",
    // Enforce single-threading globally across the entire repository workspace
    poolOptions: {
      threads: {
        singleThread: true,
      },
    },
  },
});
