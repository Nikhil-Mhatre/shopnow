import express, { Application, Request, Response, NextFunction } from "express";
import routes from "./routes.js"; //
import { morganMiddleware } from "./middleware/morgan.js";
import { logger } from "./utils/logger.js";

const app: Application = express(); //

// ==========================================
// 1. GLOBAL MIDDLEWARE
// ==========================================
// Parses incoming JSON payloads
app.use(express.json());
app.use(morganMiddleware); // Inject HTTP logging right after payload parsing

// ==========================================
// 2. HEALTH CHECK ROUTE
// ==========================================
// Used by Kubernetes/Docker to know if the container is alive
app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({
    status: "healthy",
    service: "user-service",
    timestamp: new Date().toISOString(),
  });
});

// ==========================================
// 3. MOUNT DOMAIN ROUTES
// ==========================================
// All authentication and profile routes will be prefixed with /api
app.use("/api", routes);

// ==========================================
// 4. GLOBAL ERROR HANDLER
// ==========================================
// Catches any unhandled errors from your controllers so the server doesn't crash
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error(err.message, {
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  res.status(500).json({
    error: "Internal Server Error",
    // Only send the stack trace if we are in development mode
    details: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
});

// Export the configured app instance cleanly for production entry or testing suites
export default app;
