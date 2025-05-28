import api from "./api";

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
