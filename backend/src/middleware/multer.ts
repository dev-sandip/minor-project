import { Request } from "express";
import multer, { FileFilterCallback } from "multer";



/**
 * Extends Express.Multer.File so it stays compatible with the base Request type.
 * buffer is re-declared as non-optional since memoryStorage always populates it.
 */
export interface MulterFile extends Express.Multer.File {
  buffer: Buffer;
}

/** req.file is guaranteed to exist (use after uploadSingle middleware) */
export interface SingleFileRequest extends Request {
  file: MulterFile;
}

/** req.files is a flat array (use after uploadMultiple middleware) */
export interface MultipleFilesRequest extends Request {
  files: MulterFile[];
}

/** req.files is a keyed record (use after uploadFields middleware) */
export interface FieldFilesRequest extends Request {
  files: Record<string, MulterFile[]>;
}



export const hasSingleFile = (req: Request): req is SingleFileRequest =>
  req.file !== undefined;

export const hasMultipleFiles = (req: Request): req is MultipleFilesRequest =>
  Array.isArray(req.files) && req.files.length > 0;

export const hasFieldFiles = (req: Request): req is FieldFilesRequest =>
  req.files !== undefined &&
  !Array.isArray(req.files) &&
  typeof req.files === "object";



const ALLOWED_MIME_TYPES: readonly string[] = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
];

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; 

const storage = multer.memoryStorage();

const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
): void => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `Unsupported file type "${file.mimetype}". Allowed: ${ALLOWED_MIME_TYPES.join(", ")}`
      )
    );
  }
};

const multerInstance = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE_BYTES },
});



export const uploadSingle = multerInstance.single("image");

export const uploadMultiple = multerInstance.array("images", 10);

export const uploadFields = multerInstance.fields([
  { name: "avatar", maxCount: 1 },
  { name: "gallery", maxCount: 5 },
]);