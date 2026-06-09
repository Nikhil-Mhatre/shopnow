import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Enable global assertions if needed (like describe, it, expect without importing)
    globals: true,
    // Point cleanly to your database lifecycle initialization hooks
    environment: "node",
    include: ["tests/**/*.test.ts"],
  },
});
