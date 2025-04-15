// src/app/admin/courses/[courseId]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Loader2, Pencil, ListChecks } from "lucide-react"; // Icons
import { toast } from "sonner";
import api from "@/lib/api"; // Your axios instance

interface Lesson {
  id: string;
  title: string;
  description: string;
}

export default function CourseDetailsPage() {
  const { courseId } = useParams();
  const router = useRouter();

  const [course, setCourse] = useState<{ title: string; description: string }>({
    title: "",
    description: "",
  });
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const courseRes = await api.get(`/courses/${courseId}`);
        setCourse({
          title: courseRes.data.title,
          description: courseRes.data.description,
        });

        const lessonsRes = await api.get(`/lessons/by-course/${courseId}`);
        console.log("LESSONS RESPONSE", lessonsRes.data); // 👈 Debug log
        setLessons(Array.isArray(lessonsRes.data) ? lessonsRes.data : []);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load course details");
      } finally {
        setLoading(false);
      }
    }

    if (courseId) {
      fetchData();
    }
  }, [courseId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-6 min-h-[50vh]">
        <Loader2 className="h-10 w-10 animate-spin text-gray-600" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Top Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">{course.title}</h1>
          <p className="text-gray-600 mt-2">{course.description}</p>
        </div>
        <div className="flex gap-4">
          <Button
            variant="outline"
            onClick={() => router.push(`/admin/courses/${courseId}/edit`)}
          >
            <Pencil className="h-4 w-4 mr-2" />
            Edit Course
          </Button>
          <Button
            onClick={() =>
              router.push(`/admin/courses/${courseId}/lessons/create`)
            }
          >
            Add Lesson
          </Button>
        </div>
      </div>

      {/* Lessons */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Lessons</h2>

        {lessons.length === 0 ? (
          <p className="text-gray-500">No lessons yet. Start by adding one!</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {lessons.map((lesson) => (
              <Card key={lesson.id}>
                <CardHeader>
                  <h3 className="text-lg font-semibold">{lesson.title}</h3>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{lesson.description}</p>
                </CardContent>
                <CardFooter className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      router.push(
                        `/admin/courses/${courseId}/lessons/${lesson.id}/edit`,
                      )
                    }
                  >
                    <Pencil className="h-4 w-4 mr-2" />
                    Edit Lesson
                  </Button>
                  <Button
                    size="sm"
                    onClick={() =>
                      router.push(
                        `/admin/courses/${courseId}/lessons/${lesson.id}/questions`,
                      )
                    }
                  >
                    <ListChecks className="h-4 w-4 mr-2" />
                    Manage Questions
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
