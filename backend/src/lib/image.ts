import imageKit from "../config/imagekit";


const uploadImage = (
  file: string | Buffer,
  fileName: string,
  folder: string
): Promise<any> => {
  return new Promise((resolve, reject) => {
    imageKit.upload(
      {
        file,
        fileName,
        folder,
      },
      (err, result) => {
        if (err) {
          reject(err.message);
        } else {
          resolve(result);
        }
      }
    );
  });
};

const deleteImage = (fileId: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    imageKit.deleteFile(fileId, (err, result) => {
      if (err) {
        reject(err.message);
      } else {
        resolve(result);
      }
    });
  });
};

export { uploadImage, deleteImage };