"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";
import type { Lesson } from "@/types/lesson";

export default function ViewLessonPage() {
  const { lessonId } = useParams();
  const router = useRouter();
  const [lesson, setLesson] = useState<Lesson | null>(null);

  useEffect(() => {
    async function fetchLesson() {
      try {
        const res = await api.get(`/lessons/detail/${lessonId}`);
        setLesson(res.data);
      } catch (error) {
        console.error(error);
        alert("Failed to fetch lesson.");
      }
    }

    if (lessonId) fetchLesson();
  }, [lessonId]);

  if (!lesson) return <div>Loading...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">{lesson.title}</h1>
      <p className="text-gray-600 mb-2">{lesson.description}</p>

      <div className="text-sm text-gray-500 mb-6 space-y-1">
        <p>
          <strong>Unit:</strong> {lesson.unit}
        </p>
        <p>
          <strong>Difficulty:</strong> {lesson.difficulty}
        </p>
        <p>
          <strong>XP Reward:</strong> {lesson.xp_reward}
        </p>
        <p>
          <strong>Crowns Reward:</strong> {lesson.crowns_reward}
        </p>
      </div>

      <Button
        onClick={() =>
          router.push(
            `/admin/courses/${lesson.course_id}/lessons/${lessonId}/questions/create`,
          )
        }
      >
        Add Questions
      </Button>
    </div>
  );
}
