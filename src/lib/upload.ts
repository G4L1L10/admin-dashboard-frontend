import api from "./api";

/**
 * Upload a media file (image/audio) to the backend and receive the GCS object path.
 * The path will be structured like: uploads/course_X/lesson_Y/question_Z/...
 */
/*
export async function uploadMedia(
  file: File,
  courseId?: string,
  lessonId?: string,
  questionId?: string,
): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  if (courseId) formData.append("course_id", courseId);
  if (lessonId) formData.append("lesson_id", lessonId);
  if (questionId) formData.append("question_id", questionId);

  const response = await api.post("/media/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    timeout: 20000,
  });

  return response.data.url; // This is the GCS object path
}
*/

export async function uploadViaSignedUrl(
  file: File,
  courseId?: string,
  lessonId?: string,
  questionId?: string,
): Promise<string> {
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

  await fetch(url, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  });

  return objectName;
}
