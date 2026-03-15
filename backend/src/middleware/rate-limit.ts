import rateLimit from "express-rate-limit";
import { env } from "../config/env.js";

/**
 * Global rate limiter applied to all routes.
 * Configurable via RATE_LIMIT_WINDOW_MS and RATE_LIMIT_MAX env vars.
 */
export const globalLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  limit: env.RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => env.NODE_ENV === "test",
});

/**
 * Create a custom rate limiter for specific routes.
 * @example
 * const authLimiter = createLimiter({ windowMs: 15 * 60 * 1000, limit: 5 });
 * router.post('/login', authLimiter, loginHandler);
 */
export function createLimiter(options: { windowMs: number; limit: number }) {
  return rateLimit({
    ...options,
    standardHeaders: true,
    legacyHeaders: false,
  });
}
