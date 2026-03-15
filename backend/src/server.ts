import app from "./app.js";
import { env } from "./config/env.js";
import { logger } from "./lib/logger.js";

const server = app.listen(env.PORT, () => {
  logger.info(`Server running on port ${env.PORT} in ${env.NODE_ENV} mode`);
});

const shutdown = () => {
  logger.info("Shutting down gracefully...");
  server.close(() => {
    logger.info("Server stopped");
    process.exit(0);
  });
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
