// src/lib/uploadViaSignedUrl.ts

import api from "./api";

/**
 * Upload a media file directly to GCS using a signed URL.
 * Returns the GCS object path (e.g., uploads/course_1/lesson_2/question_3/image.jpg)
 */
export async function uploadViaSignedUrl(
  file: File,
  courseId?: string,
  lessonId?: string,
  questionId?: string,
): Promise<string> {
  // Step 1: Request signed URL from backend
  const res = await api.get("/media/upload-url", {
    params: {
      filename: file.name,
      type: file.type,
      course_id: courseId,
      lesson_id: lessonId,
      question_id: questionId,
    },
  });

  const { url, objectName } = res.data;

  // Step 2: Upload directly to GCS
  await fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": file.type,
    },
    body: file,
  });

  return objectName;
}
