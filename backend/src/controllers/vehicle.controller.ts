import { Request, Response } from "express";
import { hasSingleFile } from "../middleware/multer";
import type { UploadResponse } from "imagekit/dist/libs/interfaces";
import { uploadImage } from "../lib/image";
import { ExtractedPlate, extractLicensePlate, VehicleEntryResponse } from "../lib/liscence";




class VehicleController {
  public async vehicleEntry(req: Request, res: Response): Promise<Response> {
    if (!hasSingleFile(req)) {
      return res.status(400).json({ error: "No image file provided" });
    }

    const { file } = req;

    let extracted: ExtractedPlate
    ;
    let uploaded: UploadResponse;

    try {
      [extracted, uploaded] = await Promise.all([
        extractLicensePlate(file),
        uploadImage({
          file: file.buffer,
          fileName: file.originalname,
          folder: "/vehicle-entries",
        }),
      ]);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unexpected error";
      return res.status(502).json({ error: message });
    }

    const payload: VehicleEntryResponse = {
      licensePlate: extracted.text,
      confidence: extracted.confidence,
      imageUrl: uploaded.url,
      imageFileId: uploaded.fileId,
      entryTime: new Date().toISOString(),
    };

    // TODO: persist payload to DB here
    // e.g. await VehicleEntryModel.create(payload)

    return res.status(201).json(payload);
  }
}

export default new VehicleController();