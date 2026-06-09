import { connectAMQP } from "./connection.js";
import { startStockListener } from "./stock.listener.js";
import { logger } from "../utils/logger.js"; // Replace with your logger path

export const initEventBus = async (retries = 5, delay = 5000): Promise<void> => {
  while (retries > 0) {
    try {
      logger.info("📡 Connecting to RabbitMQ Event Broker...");
      
      // 1. Establish top-level AMQP connection handles
      const connection = await connectAMQP(); 
      
      // 2. Spawn an isolated, lightweight channel wrapper
      // Note: Cast connection as 'any' or 'Connection' based on your amqplib typing compilation map
      const channel = await (connection as any).createChannel();
      
      logger.info("✅ AMQP Channel opened successfully.");

      // 3. Register your asynchronous event consumer queue topology
      await startStockListener(channel);
      logger.info("🤖 CQRS-Lite Inventory Background Listener Activated.");

      // 4. Register resilience event recovery loops
      connection.on("error", (err) => {
        logger.error("💥 AMQP Connection Error occurred:", err);
        process.exit(1); // Allow orchestration manager (Docker/K8s) to cycle the container
      });

      connection.on("close", () => {
        logger.warn("⚠️ AMQP Connection closed. Triggering restart sequence...");
        process.exit(1);
      });

      return; // Handshake completed successfully
    } catch (error: any) {
      retries--;
      logger.warn(`⚠️ AMQP Broker handoff failed. Retries remaining: ${retries}. Retrying in ${delay / 1000}s...`);
      logger.debug(`Error detail: ${error.message}`);
      await new Promise((res) => setTimeout(res, delay));
    }
  }

  logger.error("❌ Critical Failure: Could not bind to AMQP grid layout infrastructure.");
  process.exit(1);
};