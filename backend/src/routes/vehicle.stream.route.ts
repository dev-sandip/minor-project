import { Router, Request, Response } from "express";

import { desc } from "drizzle-orm";
import { vehicleEventBus } from "../controllers/vehicle.event.controller";
import { db } from "../db";
import { vehicles } from "../db/vehicle";

export const vehicleStreamRouter = Router();

vehicleStreamRouter.get("/", async (req: Request, res: Response) => {
  // --- SSE handshake ---
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no"); // disable Nginx buffering if proxied
  res.flushHeaders();

  // --- Send recent records on connect so the UI isn't blank ---
  try {
    const recent = await db
      .select()
      .from(vehicles)
      .orderBy(desc(vehicles.entryTime))
      .limit(20);

    res.write(`event: init\ndata: ${JSON.stringify(recent)}\n\n`);
  } catch (err) {
    console.error("Failed to fetch initial vehicles:", err);
  }

  // --- Subscribe to live events ---
  const onVehicle = (data: unknown) => {
    res.write(`event: vehicle\ndata: ${JSON.stringify(data)}\n\n`);
  };

  vehicleEventBus.on("vehicle", onVehicle);

  // Heartbeat — keeps the connection alive through proxies
  const heartbeat = setInterval(() => res.write(": ping\n\n"), 25_000);

  // --- Cleanup on disconnect ---
  req.on("close", () => {
    vehicleEventBus.off("vehicle", onVehicle);
    clearInterval(heartbeat);
  });
});