"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import api from "@/lib/api";
import { toast } from "sonner";

export default function CreateLessonPage() {
  const { courseId } = useParams();
  const router = useRouter();

  const [courseTitle, setCourseTitle] = useState("");
  const [unit, setUnit] = useState(1);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [difficulty, setDifficulty] = useState("easy");
  const [xpReward, setXpReward] = useState(100);
  const [crownsReward, setCrownsReward] = useState(5);

  useEffect(() => {
    async function fetchCourse() {
      try {
        const res = await api.get(`/courses/${courseId}`);
        setCourseTitle(res.data.title);
      } catch (error) {
        console.error("Failed to fetch course title", error);
        toast.error("Failed to load course title");
      }
    }

    if (courseId) fetchCourse();
  }, [courseId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post("/lessons", {
        course_id: courseId,
        unit,
        title,
        description,
        difficulty,
        xp_reward: xpReward,
        crowns_reward: crownsReward,
      });

      const lessonId = res.data.id;
      router.push(`/admin/courses/${courseId}/lessons/${lessonId}/questions`);
    } catch (error) {
      console.error("Failed to create lesson:", error);
      toast.error("Failed to create lesson.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header Card */}
      <Card>
        <CardHeader className="flex flex-col gap-1">
          <CardTitle className="text-xl">Add Lesson</CardTitle>
          <p>
            <span className="ml-1 text-gray-500">For Course: </span>
            {courseTitle}
          </p>
        </CardHeader>
      </Card>

      {/* Form Card */}
      <Card>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {/* Unit */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Unit Number
              </label>
              <Input
                type="number"
                value={unit}
                onChange={(e) => setUnit(Number(e.target.value))}
                required
              />
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lesson Title
              </label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lesson Description
              </label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
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
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
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
                value={xpReward}
                onChange={(e) => setXpReward(Number(e.target.value))}
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
                value={crownsReward}
                onChange={(e) => setCrownsReward(Number(e.target.value))}
                required
              />
            </div>

            {/* Submit + Cancel */}
            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
              <Button type="submit">Create Lesson</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
