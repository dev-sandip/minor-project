import express from "express";
import cors from "cors";
import helmet from "helmet";
// import pinoHttp from "pino-http";
import { healthRouter } from "./routes/health.js";
import { taskRouter } from "./routes/tasks.js";
import { errorHandler } from "./middleware/error-handler.js";
import { globalLimiter } from "./middleware/rate-limit.js";
import { NotFoundError } from "./lib/errors.js";
// import { logger } from "./lib/logger.js";
import { env } from "./config/env.js";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec, swaggerUiOptions } from "./lib/swagger.js";
import { userRouter } from "./routes/user.route.js";
import vehicleRouter from "./routes/vehicle.route.js";

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(globalLimiter);
// app.use(pinoHttp({ logger }));

// Routes
app.get("/", (_req, res) => {
  res.json({
    message: "Welcome to backend API",
    version: "1.0.0",
    environment: env.NODE_ENV,
  });
});

app.use("/health", healthRouter);
app.use("/api/tasks", taskRouter);
app.use("/api/auth", userRouter);
app.use("/api/vehicle",vehicleRouter)

// API Documentation
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, swaggerUiOptions));
app.get("/api/docs.json", (_req, res) => {
  res.json(swaggerSpec);
});

// 404 handler
app.all("*path", (_req, _res) => {
  throw new NotFoundError("Route not found");
});

// Error handler
app.use(errorHandler);

export default app;
