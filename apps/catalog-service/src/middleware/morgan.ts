import morgan from "morgan";
import { logger } from "../utils/logger.js";

// Pipe Morgan's stream directly into Winston at the 'info' level
const stream = {
  write: (message: string) => logger.info(message.trim()),
};

// Use the compact 'dev' format locally, and standard 'combined' format for prod
const format = process.env.NODE_ENV === "production" ? "combined" : "dev";

export const morganMiddleware = morgan(format, { stream });