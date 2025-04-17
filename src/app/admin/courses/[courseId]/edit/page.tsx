"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import api from "@/lib/api";

export default function EditCoursePage() {
  const { courseId } = useParams();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCourse() {
      try {
        const res = await api.get(`/courses/${courseId}`);
        setTitle(res.data.title);
        setDescription(res.data.description);
      } catch (error) {
        console.error(error);
        alert("Failed to fetch course.");
      } finally {
        setLoading(false);
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

  if (loading) {
    return <div className="p-6">Loading course...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-8">
      {/* Header in Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4 flex-wrap">
          <div>
            <CardTitle className="text-2xl">Edit Course</CardTitle>
            <p className="text-gray-600 mt-1">
              <span className="font-semibold">Course:</span> {title}
            </p>
          </div>
        </CardHeader>
      </Card>

      {/* Edit Form */}
      <form
        onSubmit={handleUpdate}
        className="flex flex-col gap-6 bg-white p-6 rounded-lg shadow-md"
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Course Title
          </label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit">Update Course</Button>
        </div>
      </form>
    </div>
  );
}
