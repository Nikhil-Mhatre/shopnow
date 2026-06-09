import app from "./app.js";
import { connectDB } from "./config/db.js";
import { logger } from "./utils/logger.js";

const PORT = process.env.PORT || 3001;

// ==========================================
// 5. SERVICE BOOTSTRAPPER
// ==========================================
const startService = async () => {
  try {
    // Wait for the database to connect before opening the HTTP port
    await connectDB();

    app.listen(PORT, () => {
      logger.info(`🚀 Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    logger.error(`❌ Failed to start service:`, error);
    process.exit(1); // Exit process with failure so Docker can restart the container
  }
};

// Ignite the microservice
startService();
