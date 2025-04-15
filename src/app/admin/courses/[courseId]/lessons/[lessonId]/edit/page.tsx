"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import api from "@/lib/api";

export default function EditLessonPage() {
  const { lessonId } = useParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);

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
    async function fetchLesson() {
      try {
        const res = await api.get(`/lessons/detail/${lessonId}`);
        setLessonData({
          id: lessonId as string,
          course_id: res.data.course_id,
          title: res.data.title,
          description: res.data.description,
          unit: res.data.unit,
          difficulty: res.data.difficulty,
          xp_reward: res.data.xp_reward,
          crowns_reward: res.data.crowns_reward,
        });
      } catch (error) {
        console.error("Failed to fetch lesson", error);
        toast.error("Failed to load lesson");
      } finally {
        setLoading(false);
      }
    }

    if (lessonId) fetchLesson();
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
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Edit Lesson</h1>

      <form onSubmit={handleUpdateLesson} className="flex flex-col gap-6">
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

        {/* Submit */}
        <div className="flex justify-end">
          <Button type="submit">Update Lesson</Button>
        </div>
      </form>
    </div>
  );
}
