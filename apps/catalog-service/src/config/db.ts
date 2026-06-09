import mongoose from "mongoose";
import { logger } from "../utils/logger.js";

export const connectDB = async (): Promise<void> => {
  try {
    const mongoUri =
      process.env.MONGO_URI || "mongodb://localhost:27017/ecommerce-users";
    await mongoose.connect(mongoUri);
    logger.info(`MongoDB Connected Successfully`);
  } catch (error) {
    logger.error(`MongoDB Connection Error:`, error);
    process.exit(1); // Exit process so Kubernetes can restart the pod
  }
};
