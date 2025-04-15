"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import api from "@/lib/api";
import { Pencil, Trash2 } from "lucide-react";

interface Question {
  id: string;
  question_text: string;
  question_type: string;
}

export default function QuestionsPage() {
  const { courseId, lessonId } = useParams();
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [lessonTitle, setLessonTitle] = useState("");
  const [courseTitle, setCourseTitle] = useState("");
  const [loading, setLoading] = useState(true);

  async function fetchQuestions() {
    try {
      const res = await api.get(`/lessons/${lessonId}/questions`);
      setQuestions(res.data ?? []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load questions");
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  }

  async function fetchLessonAndCourse() {
    try {
      const lessonRes = await api.get(`/lessons/detail/${lessonId}`);
      setLessonTitle(lessonRes.data.title);

      const courseRes = await api.get(`/courses/${lessonRes.data.course_id}`);
      setCourseTitle(courseRes.data.title);
    } catch (error) {
      console.error("Failed to fetch lesson or course info", error);
      toast.error("Failed to load lesson and course titles");
    }
  }

  useEffect(() => {
    if (lessonId) {
      fetchQuestions();
      fetchLessonAndCourse();
    }
  }, [lessonId]);

  async function handleDeleteQuestion(questionId: string) {
    const confirm = window.confirm(
      "Are you sure you want to delete this question?",
    );
    if (!confirm) return;

    try {
      await api.delete(`/questions/${questionId}`);
      toast.success("Question deleted!");
      fetchQuestions(); // refresh the list
    } catch (error) {
      console.error("Failed to delete question:", error);
      toast.error("Failed to delete question.");
    }
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex justify-between items-start flex-wrap gap-4 mb-6">
        {/* Left: Metadata */}
        <div className="text-gray-700">
          <p className="text-base sm:text-lg">
            <span className="font-semibold">Course:</span> {courseTitle}
          </p>
          <p className="text-base sm:text-lg">
            <span className="font-semibold">Lesson:</span> {lessonTitle}
          </p>
        </div>

        {/* Right: Header + Action */}
        <div className="flex flex-col items-end gap-2">
          <h1 className="text-xl sm:text-2xl font-bold">Questions</h1>
          <Button
            onClick={() =>
              router.push(
                `/admin/courses/${courseId}/lessons/${lessonId}/questions/create`,
              )
            }
          >
            Create Question
          </Button>
        </div>
      </div>

      {loading ? (
        <p>Loading questions...</p>
      ) : questions.length === 0 ? (
        <p className="text-gray-500">No questions yet for this lesson.</p>
      ) : (
        <ul className="space-y-4">
          {questions.map((q) => (
            <li key={q.id} className="border rounded p-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">{q.question_text}</p>
                  <p className="text-sm text-gray-500">{q.question_type}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="bg-green-500 hover:bg-green-600 text-white transition-colors duration-200"
                    onClick={() =>
                      router.push(
                        `/admin/courses/${courseId}/lessons/${lessonId}/questions/${q.id}/edit`,
                      )
                    }
                  >
                    <Pencil className="h-4 w-4 mr-2" />
                    Edit
                  </Button>

                  <Button
                    variant="destructive"
                    size="sm"
                    className="hover:bg-red-600 transition-colors duration-200"
                    onClick={() => handleDeleteQuestion(q.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
