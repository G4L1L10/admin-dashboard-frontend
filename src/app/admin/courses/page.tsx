"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Loader2, Trash2, Pencil, Eye } from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";

interface Course {
  id: string;
  title: string;
  description: string;
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function fetchCourses() {
    setLoading(true);
    try {
      const res = await api.get("/courses");
      setCourses(res.data || []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch courses!");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(courseId: string) {
    const confirm = window.confirm(
      "Are you sure you want to delete this course?",
    );
    if (!confirm) return;

    try {
      await api.delete(`/courses/${courseId}`);
      toast.success("Course deleted!");
      fetchCourses(); // Refresh the list after deletion
    } catch (error) {
      console.error("Failed to delete course:", error);
      toast.error("Failed to delete course");
    }
  }

  useEffect(() => {
    fetchCourses();
  }, []);

  return (
    <div className="flex flex-col gap-10">
      {/* Header / Page Actions */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <h1 className="text-2xl font-bold">All Courses</h1>
          <div className="flex gap-3">
            <Button onClick={() => router.push("/admin/courses/create")}>
              Create New
            </Button>
            <Button variant="outline" onClick={fetchCourses}>
              {loading ? (
                <Loader2 className="animate-spin h-4 w-4" />
              ) : (
                "Refresh"
              )}
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Courses Grid */}
      {Array.isArray(courses) && courses.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <Card key={course.id}>
              <CardHeader>
                <h2 className="text-lg font-semibold">{course.title}</h2>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">{course.description}</p>
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => router.push(`/admin/courses/${course.id}`)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View
                </Button>
                <Button
                  size="sm"
                  onClick={() =>
                    router.push(`/admin/courses/${course.id}/edit`)
                  }
                >
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(course.id)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-gray-500">
          No courses found. Create one to get started!
        </div>
      )}
    </div>
  );
}
