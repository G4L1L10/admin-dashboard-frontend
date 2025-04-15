// src/app/admin/courses/[courseId]/lessons/[lessonId]/questions/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import api from "@/lib/api";
import { Pencil } from "lucide-react";

interface Question {
  id: string;
  question_text: string;
  question_type: string;
}

export default function QuestionsPage() {
  const { courseId, lessonId } = useParams();
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchQuestions() {
      try {
        const res = await api.get(`/lessons/${lessonId}/questions`);
        setQuestions(res.data ?? []); // ✅ fallback to [] if null
      } catch (error) {
        console.error(error);
        toast.error("Failed to load questions");
        setQuestions([]); // ✅ prevent null fallback
      } finally {
        setLoading(false);
      }
    }

    if (lessonId) fetchQuestions();
  }, [lessonId]);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Questions</h1>
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
                <Button
                  variant="outline"
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
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
