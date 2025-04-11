// src/app/admin/courses/[courseId]/edit/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation"; // ✅ import useRouter
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import api from "@/lib/api";

export default function EditCoursePage() {
  const { courseId } = useParams();
  const router = useRouter(); // ✅ initialize router
  const [courseTitle, setCourseTitle] = useState("");
  const [loading, setLoading] = useState(true);

  const [unit, setUnit] = useState(1);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [difficulty, setDifficulty] = useState("easy");
  const [xpReward, setXpReward] = useState(100);
  const [crownsReward, setCrownsReward] = useState(5);

  // Fetch the course title on page load
  useEffect(() => {
    async function fetchCourse() {
      try {
        const res = await api.get(`/courses/${courseId}`);
        setCourseTitle(res.data.title);
      } catch (error) {
        console.error("Failed to fetch course title:", error);
        setCourseTitle("Unknown Course");
      } finally {
        setLoading(false);
      }
    }

    if (courseId) {
      fetchCourse();
    }
  }, [courseId]);

  const handleCreateLesson = async (e: React.FormEvent) => {
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

      console.log("Lesson Created:", res.data);
      //      alert("Lesson created successfully!");

      const lessonId = res.data.id; // ✅ Capture the returned lessonId

      // ✅ Redirect to Create Questions page
      router.push(`/admin/lessons/${lessonId}/questions/create`);
    } catch (error) {
      console.error("Failed to create lesson:", error);
      alert("Failed to create lesson. Check console for details.");
    }
  };

  if (loading) {
    return <div className="p-6">Loading course...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">
        Add Lesson for {courseTitle}
      </h1>

      <form onSubmit={handleCreateLesson} className="flex flex-col gap-6">
        {/* Unit Number */}
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

        {/* Lesson Title */}
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

        {/* Lesson Description */}
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

        {/* Submit Button */}
        <div className="flex justify-end">
          <Button type="submit">Next</Button>
        </div>
      </form>
    </div>
  );
}
