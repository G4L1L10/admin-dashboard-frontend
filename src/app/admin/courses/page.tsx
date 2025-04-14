// src/app/admin/courses/page.tsx
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Loader2, Trash2, Pencil } from "lucide-react"; // Icons
import api from "@/lib/api"; // Axios instance
import { toast } from "sonner";

interface Course {
  id: string;
  title: string;
  description: string;
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);

  async function fetchCourses() {
    setLoading(true);
    try {
      const res = await api.get("/courses"); // ✅ This hits GET /api/courses now
      setCourses(res.data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch courses!");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCourses(); // Load on page mount
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Courses</h1>
        <Button onClick={fetchCourses}>
          {loading ? <Loader2 className="animate-spin h-4 w-4" /> : "Refresh"}
        </Button>
      </div>

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
              <Button variant="outline" size="sm">
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button variant="destructive" size="sm">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
