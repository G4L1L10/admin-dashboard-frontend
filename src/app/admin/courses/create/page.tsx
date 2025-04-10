"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import api from "@/lib/api"; // <-- Import axios instance

export default function CreateCoursePage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await api.post("/courses", {
        title,
        description,
      });

      console.log("Course Created:", res.data);

      // Redirect to edit course page after creating
      router.push(`/admin/courses/${res.data.id}/edit`);
    } catch (error) {
      console.error("Failed to create course:", error);
      alert("Failed to create course. Check console for details.");
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">
        Create New Course
      </h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {/* Course Title */}
        <div className="flex flex-col gap-2">
          <label htmlFor="title" className="text-sm font-medium text-gray-700">
            Course Title
          </label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter course title"
            required
          />
        </div>

        {/* Course Description */}
        <div className="flex flex-col gap-2">
          <label
            htmlFor="description"
            className="text-sm font-medium text-gray-700"
          >
            Course Description
          </label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter course description"
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
