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
import { Loader2, Pencil, ListChecks, BookOpen, Trash2 } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";

interface Lesson {
  id: string;
  title: string;
  description: string;
  unit: number;
  difficulty: string;
  xp_reward: number;
  crowns_reward: number;
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

  async function handleDeleteLesson(lessonId: string) {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this lesson?",
    );
    if (!confirmDelete) return;

    try {
      await api.delete(`/lessons/${lessonId}`);
      toast.success("Lesson deleted!");
      setLessons((prev) => prev.filter((lesson) => lesson.id !== lessonId));
    } catch (error) {
      console.error("Failed to delete lesson", error);
      toast.error("Failed to delete lesson.");
    }
  }

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
            <h1 className="text-xl font-semibold mb-5">
              All Lessons
            </h1>
            <p>
              <span className="font-semibold text-gray-600">Course title:</span>{" "}
              {course.title}
            </p>
            <p>
              <span className="font-semibold text-gray-600">
                Course description:
              </span>{" "}
              {course.description}
            </p>
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
                   <p><span className="font-medium text-gray-800">Unit:</span> {lesson.unit}</p>
                  <p><span className="font-medium text-gray-800">Difficulty:</span> {lesson.difficulty}</p>
                  <p><span className="font-medium text-gray-800">XP Reward:</span> {lesson.xp_reward}</p>
                  <p><span className="font-medium text-gray-800">Crowns:</span> {lesson.crowns_reward}</p>
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
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteLesson(lesson.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
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
