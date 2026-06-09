import winston from "winston";

const { combine, timestamp, printf, colorize, json } = winston.format;

// Custom format for local development terminal
const consoleFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} [User Service] ${level}: ${message}`;
});

export const logger = winston.createLogger({
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  format: combine(
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    // Use structured JSON in production for log aggregators, colored text for dev
    process.env.NODE_ENV === "production"
      ? json()
      : combine(colorize(), consoleFormat),
  ),
  transports: [
    // In a Kubernetes environment, writing to stdout/stderr is best practice
    new winston.transports.Console(),
  ],
});
