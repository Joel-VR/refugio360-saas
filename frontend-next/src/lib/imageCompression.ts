import imageCompression from "browser-image-compression";

/** Comprime y redimensiona una imagen en el navegador antes de subirla. */
export async function compressImage(file: File): Promise<File> {
  if (!file.type.startsWith("image/") || file.type === "image/svg+xml") {
    return file;
  }

  try {
    return await imageCompression(file, {
      maxSizeMB: 0.5,
      maxWidthOrHeight: 1600,
      useWebWorker: true,
      fileType: file.type,
    });
  } catch {
    return file;
  }
}
