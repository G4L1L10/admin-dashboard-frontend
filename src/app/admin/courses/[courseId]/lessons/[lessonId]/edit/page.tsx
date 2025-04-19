"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import api from "@/lib/api";

export default function EditLessonPage() {
  const { lessonId } = useParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [courseTitle, setCourseTitle] = useState("");

  const [lessonData, setLessonData] = useState({
    id: "",
    course_id: "",
    title: "",
    description: "",
    unit: 1,
    difficulty: "easy",
    xp_reward: 100,
    crowns_reward: 5,
  });

  useEffect(() => {
    async function fetchLessonAndCourse() {
      try {
        const res = await api.get(`/lessons/detail/${lessonId}`);
        const lesson = res.data;

        setLessonData({
          id: lessonId as string,
          course_id: lesson.course_id,
          title: lesson.title,
          description: lesson.description,
          unit: lesson.unit,
          difficulty: lesson.difficulty,
          xp_reward: lesson.xp_reward,
          crowns_reward: lesson.crowns_reward,
        });

        const courseRes = await api.get(`/courses/${lesson.course_id}`);
        setCourseTitle(courseRes.data.title);
      } catch (error) {
        console.error("Failed to fetch lesson", error);
        toast.error("Failed to load lesson or course");
      } finally {
        setLoading(false);
      }
    }

    if (lessonId) fetchLessonAndCourse();
  }, [lessonId]);

  const handleUpdateLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.put(`/lessons/${lessonId}`, lessonData);
      toast.success("Lesson updated!");
      router.back();
    } catch (error) {
      console.error(error);
      toast.error("Failed to update lesson");
    }
  };

  if (loading) {
    return <div className="p-6">Loading lesson...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header in Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4 flex-wrap">
          <div>
            <CardTitle className="text-xl font-semibold">Edit Lesson</CardTitle>
            <p className="text-gray-600 mt-1">
              <span className="font-semibold">Course:</span> {courseTitle}
              <br />
            </p>
          </div>
        </CardHeader>
      </Card>

      {/* Edit Form */}
      <form
        onSubmit={handleUpdateLesson}
        className="flex flex-col gap-6 bg-white p-6 rounded-lg shadow-md"
      >
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Lesson Title
          </label>
          <Input
            value={lessonData.title}
            onChange={(e) =>
              setLessonData({ ...lessonData, title: e.target.value })
            }
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Lesson Description
          </label>
          <Textarea
            value={lessonData.description}
            onChange={(e) =>
              setLessonData({ ...lessonData, description: e.target.value })
            }
            required
          />
        </div>

        {/* Unit */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Unit Number
          </label>
          <Input
            type="number"
            value={lessonData.unit}
            onChange={(e) =>
              setLessonData({ ...lessonData, unit: Number(e.target.value) })
            }
            required
          />
        </div>

        {/* Difficulty */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Difficulty
          </label>
          <select
            className="w-full border-gray-300 rounded-md shadow-sm"
            value={lessonData.difficulty}
            onChange={(e) =>
              setLessonData({ ...lessonData, difficulty: e.target.value })
            }
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>

        {/* XP Reward */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            XP Reward
          </label>
          <Input
            type="number"
            value={lessonData.xp_reward}
            onChange={(e) =>
              setLessonData({
                ...lessonData,
                xp_reward: Number(e.target.value),
              })
            }
            required
          />
        </div>

        {/* Crowns Reward */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Crowns Reward
          </label>
          <Input
            type="number"
            value={lessonData.crowns_reward}
            onChange={(e) =>
              setLessonData({
                ...lessonData,
                crowns_reward: Number(e.target.value),
              })
            }
            required
          />
        </div>

        {/* Submit + Cancel */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit">Update Lesson</Button>
        </div>
      </form>
    </div>
  );
}
