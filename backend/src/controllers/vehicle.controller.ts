import { Request, Response } from "express";
import { hasSingleFile } from "../middleware/multer";
import type { UploadResponse } from "imagekit/dist/libs/interfaces";
import { uploadImage } from "../lib/image";
import { ExtractedPlate, extractLicensePlate } from "../lib/liscence";
import { db } from "../db";
import { vehicles } from "../db/vehicle";
import { eq, and, isNull, isNotNull } from "drizzle-orm";
import billingLogic from "../lib/billingLogic";

class VehicleController {
  public async vehicleEntry(req: Request, res: Response): Promise<Response> {
    if (!hasSingleFile(req)) {
      return res.status(400).json({ error: "No image file provided" });
    }

    const { file } = req;
    let extracted: ExtractedPlate;
    let uploaded: UploadResponse;

    try {
      [extracted, uploaded] = await Promise.all([
        extractLicensePlate(file),
        uploadImage({ file: file.buffer, fileName: file.originalname, folder: "/vehicle-entries" }),
      ]);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unexpected error";
      return res.status(502).json({ error: message });
    }

    // Block if this plate is currently parked (entered but not yet exited)
    const activeEntry = await db.query.vehicles.findFirst({
      where: and(
        eq(vehicles.licensePlate, extracted.text),
        isNull(vehicles.exitTime)
      ),
    });

    if (activeEntry) {
      return res.status(409).json({
        error: "Vehicle is already parked",
        message: `License plate ${extracted.text} has an active entry from ${activeEntry.entryTime.toISOString()}`,
        data: activeEntry,
      });
    }

    // Safe to insert — either first time or previously exited vehicle re-entering
    const [newVehicle] = await db.insert(vehicles).values({
      licensePlate: extracted.text,
      imageUrl: uploaded.url,
      imageKey: uploaded.fileId,
      confidence: extracted.confidence,
    }).returning();

    return res.status(201).json({
      message: "Vehicle entry recorded successfully!",
      data: newVehicle,
    });
  }

  public async vehicleExit(req: Request, res: Response): Promise<Response> {
    if (!hasSingleFile(req)) {
      return res.status(400).json({ error: "No image file provided" });
    }

    const { file } = req;
    let extracted: ExtractedPlate;
    let uploaded: UploadResponse;

    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      [extracted, uploaded] = await Promise.all([
        extractLicensePlate(file),
        uploadImage({ file: file.buffer, fileName: file.originalname, folder: "/vehicle-exits" }),
      ]);
      
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unexpected error";
      return res.status(502).json({ error: message });
    }

    // Find the active (not yet exited) entry for this plate
    const activeEntry = await db.query.vehicles.findFirst({
      where: and(
        eq(vehicles.licensePlate, extracted.text),
        isNull(vehicles.exitTime)
      ),
    });

    if (!activeEntry) {
      // Distinguish "already exited" from "never entered"
      const lastExit = await db.query.vehicles.findFirst({
        where: and(
          eq(vehicles.licensePlate, extracted.text),
          isNotNull(vehicles.exitTime)
        ),
      });

      if (lastExit) {
        return res.status(409).json({
          error: "Vehicle has already exited",
          message: `License plate ${extracted.text} already exited at ${lastExit.exitTime?.toISOString()}`,
        });
      }

      return res.status(404).json({
        error: "Vehicle entry not found",
        message: `No entry record found for license plate ${extracted.text}`,
      });
    }

    const exitTime = new Date();
    const totalAmount = billingLogic.calculateAmount(activeEntry.entryTime, exitTime);

    const [updatedVehicle] = await db
      .update(vehicles)
      .set({ exitTime, totalAmount: totalAmount.toString() })
      .where(
        and(
          eq(vehicles.id, activeEntry.id),
          isNull(vehicles.exitTime)   // race condition guard
        )
      )
      .returning();

    if (!updatedVehicle) {
      return res.status(409).json({
        error: "Exit already processed",
        message: "Another exit was recorded simultaneously for this vehicle",
      });
    }

    return res.status(200).json({
      message: "Vehicle exit recorded successfully!",
      data: updatedVehicle,
    });
  }

  public async getAllVehicles(_req: Request, res: Response): Promise<Response> {
    const allVehicles = await db.query.vehicles.findMany({
      orderBy: (vehicles, { desc }) => [desc(vehicles.entryTime)],
    });
    return res.status(200).json({ data: allVehicles });
  }

  public async getVehicleById(req: Request, res: Response): Promise<Response> {
    const { id } = req.params;
    const vehicle = await db.query.vehicles.findFirst({
      where: eq(vehicles.id, String(id)),
    });
    if (!vehicle) {
      return res.status(404).json({ error: "Vehicle not found" });
    }
    return res.status(200).json({ data: vehicle });
  }
}

export default new VehicleController();