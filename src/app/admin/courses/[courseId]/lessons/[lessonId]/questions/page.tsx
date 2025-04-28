"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { toast } from "sonner";
import api from "@/lib/api";
import { Pencil, Trash2, Tag, BookOpen } from "lucide-react";
import SignedImage from "@/components/SignedImage";
import SignedAudio from "@/components/SignedAudio";

interface Question {
  id: string;
  question_text: string;
  question_type: string;
  options: string[];
  answer: string;
  explanation: string;
  image_url?: string;
  audio_url?: string;
  tags: string[];
}

export default function QuestionsPage() {
  const { courseId, lessonId } = useParams();
  const router = useRouter();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [lessonTitle, setLessonTitle] = useState("");
  const [courseTitle, setCourseTitle] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (lessonId) {
      fetchQuestions();
      fetchLessonAndCourse();
    }
  }, [lessonId]);

  async function fetchQuestions() {
    try {
      const res = await api.get(`/lessons/${lessonId}/questions`);
      setQuestions(res.data ?? []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load questions");
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

  async function handleDeleteQuestion(questionId: string) {
    const confirm = window.confirm(
      "Are you sure you want to delete this question?",
    );
    if (!confirm) return;

    try {
      await api.delete(`/questions/${questionId}`);
      toast.success("Question deleted!");
      fetchQuestions();
    } catch (error) {
      console.error("Failed to delete question:", error);
      toast.error("Failed to delete question.");
    }
  }

  function extractObjectName(fullUrl?: string): string {
    if (!fullUrl) return "";
    const parts = fullUrl.split("/"); // ["https:", "", "storage.googleapis.com", "bucket", "uploads", "filename"]
    const index = parts.findIndex((p) => p === "uploads");
    return parts.slice(index).join("/"); // "uploads/filename"
  }

  return (
    <div className="flex flex-col gap-10">
      <Card>
        <CardHeader className="flex flex-row items-start justify-between">
          <div>
            <h1 className="text-xl font-semibold mb-5">All Questions</h1>
            <p>
              <span className="font-semibold text-gray-600">Course title:</span>{" "}
              {courseTitle}
            </p>
            <p>
              <span className="font-semibold text-gray-600">Lesson title:</span>{" "}
              {lessonTitle}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 mt-1">
            <Button
              variant="outline"
              onClick={() => router.push(`/admin/courses/${courseId}`)}
            >
              <BookOpen className="h-4 w-4 mr-2" />
              All Lessons
            </Button>
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
        </CardHeader>
      </Card>

      {loading ? (
        <p>Loading questions...</p>
      ) : questions.length === 0 ? (
        <p className="text-gray-500">No questions yet for this lesson.</p>
      ) : (
        <div className="space-y-4">
          {questions.map((q) => (
            <Card key={q.id}>
              <CardContent className="space-y-8 text-gray-700 pt-6 bg-gray-50 rounded-md">
                {/* Question Text */}
                <div className="space-y-1 border-b pb-4">
                  <p className="text-lg font-semibold">Question:</p>
                  <p className="text-gray-800">{q.question_text}</p>
                </div>

                {/* Question Type */}
                <div className="space-y-1 border-b pb-4">
                  <p className="text-lg font-semibold">Question Type:</p>
                  <p className="capitalize text-gray-800">{q.question_type}</p>
                </div>

                {/* Options */}
                {q.options?.length > 0 && (
                  <div className="space-y-2 border-b pb-4">
                    <p className="text-lg font-semibold">Options:</p>
                    <ul className="list-disc pl-6 text-gray-800">
                      {q.question_type === "matching_pairs"
                        ? q.options.map((opt, i) => (
                            <li key={i}>{opt.replace("::", " ⇄ ")}</li>
                          ))
                        : q.options.map((opt, i) => <li key={i}>{opt}</li>)}
                    </ul>
                  </div>
                )}

                {/* Answer */}
                {q.answer && (
                  <div className="space-y-1 border-b pb-4">
                    <p className="text-lg font-semibold">Answer:</p>
                    <p className="text-gray-800">{q.answer}</p>
                  </div>
                )}

                {/* Explanation */}
                {q.explanation && (
                  <div className="space-y-1 border-b pb-4">
                    <p className="text-lg font-semibold">Explanation:</p>
                    <p className="text-gray-800">{q.explanation}</p>
                  </div>
                )}

                {/* Image */}
                {q.image_url && (
                  <div className="space-y-2">
                    <p className="text-lg font-semibold text-center">
                      Image Preview
                    </p>
                    <div className="flex justify-center">
                      <div className="bg-white p-3 rounded-lg shadow-md">
                        <SignedImage object={extractObjectName(q.image_url)} />
                      </div>
                    </div>
                  </div>
                )}

                {/* Audio */}
                {q.audio_url && (
                  <div className="space-y-2">
                    <p className="text-lg font-semibold text-center">
                      Audio Playback
                    </p>
                    <div className="flex justify-center">
                      <div className="p-3 rounded-lg max-w-2xl w-full">
                        <SignedAudio object={extractObjectName(q.audio_url)} />
                      </div>
                    </div>
                  </div>
                )}

                {/* Tags */}
                {q.tags?.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-lg font-semibold flex items-center gap-2">
                      <Tag className="w-5 h-5" />
                      Tags
                    </p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {q.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="inline-block bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>

              <CardFooter className="flex justify-end gap-2">
                <Button
                  size="sm"
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
                  onClick={() => handleDeleteQuestion(q.id)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
