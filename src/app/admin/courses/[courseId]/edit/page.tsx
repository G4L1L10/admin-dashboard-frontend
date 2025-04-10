// src/app/admin/courses/[courseId]/edit/page.tsx
"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import api from "@/lib/api";

export default function EditCoursePage() {
  const { courseId } = useParams();

  const [unit, setUnit] = useState(1);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [difficulty, setDifficulty] = useState("easy");
  const [xpReward, setXpReward] = useState(100);
  const [crownsReward, setCrownsReward] = useState(5);

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
      alert("Lesson created successfully!");

      // Clear form
      setUnit(unit + 1);
      setTitle("");
      setDescription("");
      setDifficulty("easy");
      setXpReward(100);
      setCrownsReward(5);
    } catch (error) {
      console.error("Failed to create lesson:", error);
      alert("Failed to create lesson. Check console for details.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">
        Add Lesson for Course {courseId}
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
