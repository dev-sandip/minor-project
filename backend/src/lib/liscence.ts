
import {  MulterFile } from "../middleware/multer";


export interface ConfidenceStats {
  mean: number;
  min: number;
  max: number;
  std: number;
}

export interface Plate {
  lines: string[];
  multiline_text: string;
  singleline_text: string;
  num_lines: number;
  total_chars: number;
  confidence_stats: ConfidenceStats;
}

export interface LicensePlateResponse {
  image_path: string;
  num_plates: number;
  plates: Plate[];
}


export interface ExtractedPlate {
  text: string;
  confidence: ConfidenceStats;
}

export interface VehicleEntryResponse {
  licensePlate: string;
  confidence: ConfidenceStats;
  imageUrl: string;
  imageFileId: string;
  entryTime: string;
}


export const extractLicensePlate = async (file: MulterFile): Promise<ExtractedPlate> => {
  const baseUrl = process.env.PLATE_SERVICE_URL;
  if (!baseUrl) throw new Error("PLATE_SERVICE_URL is not defined");

  const formData = new FormData();
  const blob = new Blob([file.buffer], { type: file.mimetype });
  formData.append("file", blob, file.originalname);

  const response = await fetch(baseUrl, { method: "POST", body: formData });
  const raw = await response.text();

  if (!response.ok) {
    throw new Error(`Plate service failed [${response.status}]: ${raw}`);
  }

  if (!raw || raw.trim() === "") {
    throw new Error("Plate service returned an empty response body");
  }

  let data: LicensePlateResponse;
  try {
    data = JSON.parse(raw) as LicensePlateResponse;
  } catch {
    throw new Error(`Plate service returned non-JSON: ${raw}`);
  }

  if (data.num_plates === 0 || !data.plates?.length) {
    throw new Error("No license plates detected in the image");
  }

  const best = data.plates.reduce((prev, curr) =>
    curr.confidence_stats.mean > prev.confidence_stats.mean ? curr : prev
  );

  return {
    text: best.singleline_text,
    confidence: best.confidence_stats,
  };
};

