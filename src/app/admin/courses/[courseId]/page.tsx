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
import { Badge } from "@/components/ui/badge";
import { Loader2, Pencil, ListChecks, BookOpen } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";

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
    <div className="flex flex-col gap-10">
      {/* Course Info Card */}
      <Card>
        <CardHeader className="flex flex-row items-start justify-between">
          <div>
            <Badge variant="secondary" className="mb-2">
              Course
            </Badge>
            <h1 className="text-2xl font-bold">{course.title}</h1>
            <p className="text-gray-600 mt-1">{course.description}</p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 mt-1">
            <Button
              variant="outline"
              onClick={() => router.push("/admin/courses")}
            >
              <BookOpen className="h-4 w-4 mr-2" />
              All Courses
            </Button>
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
              <span className="text-lg font-bold mr-2">+</span>
              Add Lesson
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Lessons Section */}
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
                    Edit
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
                    Questions
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
