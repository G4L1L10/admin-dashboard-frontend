// src/lib/upload.ts
import api from "./api";

/**
 * Upload a media file (image/audio) to the backend and receive a public URL.
 */
export async function uploadMedia(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await api.post("/media/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data.url;
}
