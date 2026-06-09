import app from "./app.js";
import { connectDB } from "./config/db.js";
import { connectAMQP } from "./event-bus/connection.js";
import { initEventBus } from "./event-bus/index.js";
import { startStockListener } from "./event-bus/stock.listener.js";
import { logger } from "./utils/logger.js";

const PORT = process.env.PORT || 3002;

// ==========================================
// 5. SERVICE BOOTSTRAPPER
// ==========================================
const startService = async () => {
  try {
    // Wait for the database to connect before opening the HTTP port
    await connectDB();

    // Phase 2: Start your newly implemented AMQP stock sync listener daemon!
    await initEventBus();

    app.listen(PORT, () => {
      logger.info(
        `🚀 Catalog Service running successfully on execution target port: ${PORT}`,
      );
    });
  } catch (error) {
    logger.error(`❌ Failed to start Catalog Service:`, error);
    process.exit(1); // Exit process with failure so Docker can restart the container
  }
};

// Ignite the microservice
startService();
