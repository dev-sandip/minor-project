import imageKit from "../config/imagekit";
import type { UploadResponse } from "imagekit/dist/libs/interfaces";

interface UploadOptions {
  file: string | Buffer;
  fileName: string;
  folder: string;
}

const uploadImage = (options: UploadOptions): Promise<UploadResponse> => {
  return new Promise((resolve, reject) => {
    imageKit.upload(options, (err, result) => {
      if (err) {
        reject(new Error(err.message));
      } else if (!result) {
        reject(new Error("Upload succeeded but returned no result"));
      } else {
        resolve(result);
      }
    });
  });
};

const deleteImage = (fileId: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    imageKit.deleteFile(fileId, (err) => {
      if (err) {
        reject(new Error(err.message));
      } else {
        resolve();
      }
    });
  });
};

export { uploadImage, deleteImage };
export type { UploadOptions };