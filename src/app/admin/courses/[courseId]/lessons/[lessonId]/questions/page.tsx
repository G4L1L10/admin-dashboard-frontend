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

  return (
    <div className="flex flex-col gap-10">
      {/* Header */}
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

          {/* Action Buttons */}
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

      {/* List */}
      {loading ? (
        <p>Loading questions...</p>
      ) : questions.length === 0 ? (
        <p className="text-gray-500">No questions yet for this lesson.</p>
      ) : (
        <div className="space-y-4">
          {questions.map((q) => (
            <Card key={q.id}>
              <CardContent className="space-y-4 text-sm text-gray-700 pt-6">
                <div>
                  <p className="font-medium">Question:</p>
                  <p className="text-gray-800">{q.question_text}</p>
                </div>

                <div>
                  <p className="font-medium">Question Type:</p>
                  <p className="capitalize text-gray-800">{q.question_type}</p>
                </div>

                {q.options?.length > 0 && (
                  <div>
                    <p className="font-medium">Options:</p>
                    <ul className="list-disc pl-4 text-gray-800">
                      {q.question_type === "matching_pairs"
                        ? q.options.map((opt, i) => (
                          <li key={i}>{opt.replace("::", " ⇄ ")}</li>
                        ))
                        : q.options.map((opt, i) => <li key={i}>{opt}</li>)}
                    </ul>
                  </div>
                )}

                {q.answer && (
                  <div>
                    <p className="font-medium">Answer:</p>
                    <p className="text-gray-800">{q.answer}</p>
                  </div>
                )}

                {q.explanation && (
                  <div>
                    <p className="font-medium">Explanation:</p>
                    <p className="text-gray-800">{q.explanation}</p>
                  </div>
                )}

                {q.image_url && (
                  <div>
                    <p className="font-medium mb-1">Image:</p>
                    <img
                      src={q.image_url}
                      alt="question"
                      className="max-w-xs rounded-lg border"
                    />
                  </div>
                )}

                {q.audio_url && (
                  <div>
                    <p className="font-medium mb-1">Audio:</p>
                    <audio controls className="w-full">
                      <source src={q.audio_url} />
                      Your browser does not support the audio element.
                    </audio>
                  </div>
                )}

                {q.tags?.length > 0 && (
                  <div>
                    <p className="font-medium mb-1 flex items-center gap-1">
                      <Tag className="w-4 h-4" />
                      Tags:
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
