import app from "./app.js";
import { env } from "./config/env.js";
import { logger } from "./lib/logger.js";
import {
  startVehicleListener,
  stopVehicleListener,
} from "./controllers/vehicle.event.controller.js";

const server = app.listen(env.PORT, () => {
  logger.info(`Server running on port ${env.PORT} in ${env.NODE_ENV} mode`);
});

// Start Postgres LISTEN/NOTIFY consumer for vehicle events (SSE depends on this)
startVehicleListener().catch((err: unknown) => {
  logger.error(
    { err },
    "Failed to start vehicle listener (live updates will not work)"
  );
});

const shutdown = () => {
  logger.info("Shutting down gracefully...");
  stopVehicleListener().catch(() => {});
  server.close(() => {
    logger.info("Server stopped");
    process.exit(0);
  });
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
