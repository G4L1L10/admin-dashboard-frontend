"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
  position: number;
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
    const parts = fullUrl.split("/");
    const index = parts.findIndex((p) => p === "uploads");
    return parts.slice(index).join("/");
  }

  return (
    <div className="flex flex-col gap-10">
      <Card>
        <CardHeader className="flex flex-row items-start justify-between">
          <div>
            <h1 className="text-xl font-semibold mb-5">All Questions</h1>
            <p className="text-sm text-gray-600">
              <strong>Course title:</strong> {courseTitle}
            </p>
            <p className="text-sm text-gray-600">
              <strong>Lesson title:</strong> {lessonTitle}
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
        <div className="space-y-6">
          {questions.map((q) => (
            <Card key={q.id}>
              <CardHeader className="flex justify-between items-center px-6 pt-6">
                <span className="inline-block bg-gray-600 text-white text-sm font-regular rounded-sm px-3 py-2">
                  Qns {q.position}
                </span>
                <div className="flex gap-2">
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
                </div>
              </CardHeader>

              <CardContent className="space-y-6 text-gray-800 px-6 pb-6">
                {/* Question Text */}
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Question Text
                  </p>
                  <p className="text-base font-semibold">{q.question_text}</p>
                </div>

                {/* Question Type */}
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Question Type
                  </p>
                  <p className="capitalize text-base font-semibold">
                    {q.question_type}
                  </p>
                </div>

                {/* Options */}
                {q.options?.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Options</p>
                    <ul className="list-disc pl-6 space-y-1 font-medium">
                      {q.question_type === "matching_pairs"
                        ? q.options.map((opt, i) => (
                          <li key={i}>{opt.replace("::", " ⇄ ")}</li>
                        ))
                        : q.options.map((opt, i) => <li key={i}>{opt}</li>)}
                    </ul>
                  </div>
                )}

                {/* Answer */}
                {q.answer && q.question_type === "matching_pairs" ? (
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">
                      Answer
                    </p>
                    <div className="space-y-2">
                      {JSON.parse(q.answer).map(
                        ([left, right]: [string, string], idx: number) => (
                          <div key={idx} className="flex items-center gap-4">
                            {left.endsWith(".png") ||
                              left.endsWith(".PNG") ||
                              left.endsWith(".jpg") ||
                              left.endsWith(".jpeg") ? (
                              <SignedImage object={extractObjectName(left)} />
                            ) : left.endsWith(".mp3") ||
                              left.endsWith(".m4a") ||
                              left.endsWith(".wav") ? (
                              <SignedAudio object={extractObjectName(left)} />
                            ) : (
                              <span className="text-sm text-gray-800">
                                {left}
                              </span>
                            )}
                            <span className="text-gray-400">⇄</span>
                            <span className="text-sm text-gray-900 font-medium">
                              {right}
                            </span>
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                ) : (
                  q.answer && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Answer
                      </p>
                      <p className="font-semibold">{q.answer}</p>
                    </div>
                  )
                )}

                {/* Explanation */}
                {q.explanation && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Explanation
                    </p>
                    <p className="font-semibold">{q.explanation}</p>
                  </div>
                )}

                {/* Image */}
                {q.image_url && (
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-2">
                      Image
                    </p>
                    <div className="rounded-md p-3 max-w-sm">
                      <SignedImage object={extractObjectName(q.image_url)} />
                    </div>
                  </div>
                )}

                {/* Audio */}
                {q.audio_url && (
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-2">
                      Audio
                    </p>
                    <div className="p-3 max-w-xl">
                      <SignedAudio object={extractObjectName(q.audio_url)} />
                    </div>
                  </div>
                )}

                {/* Tags */}
                {q.tags?.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-2 flex items-center gap-2">
                      <Tag className="w-4 h-4" /> Tags
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {q.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="inline-block bg-gray-800 text-white text-xs font-medium px-3 py-2 rounded-sm"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
