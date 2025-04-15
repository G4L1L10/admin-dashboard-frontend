"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import api from "@/lib/api";

export default function EditCoursePage() {
  const { courseId } = useParams();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    async function fetchCourse() {
      try {
        const res = await api.get(`/courses/${courseId}`);
        setTitle(res.data.title);
        setDescription(res.data.description);
      } catch (error) {
        console.error(error);
        alert("Failed to fetch course.");
      }
    }
    if (courseId) fetchCourse();
  }, [courseId]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.put(`/courses/${courseId}`, { title, description });
      router.push(`/admin/courses/${courseId}`);
    } catch (error) {
      console.error(error);
      alert("Failed to update course.");
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6">Edit Course</h1>
      <form onSubmit={handleUpdate} className="flex flex-col gap-6">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
        <Button type="submit">Update Course</Button>
      </form>
    </div>
  );
}
