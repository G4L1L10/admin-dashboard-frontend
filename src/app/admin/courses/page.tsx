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
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Loader2, Trash2, Pencil, Eye } from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";

interface Course {
  id: string;
  title: string;
  description: string;
  created_at?: string;
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState("title_asc");
  const router = useRouter();

  async function fetchCourses() {
    setLoading(true);
    try {
      const res = await api.get("/courses");
      const fetched = res.data || [];
      setCourses(sortCourses(fetched, sortBy));
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch courses!");
    } finally {
      setLoading(false);
    }
  }

  function sortCourses(list: Course[], sort: string) {
    const sorted = [...list];
    switch (sort) {
      case "title_asc":
        return sorted.sort((a, b) => a.title.localeCompare(b.title));
      case "title_desc":
        return sorted.sort((a, b) => b.title.localeCompare(a.title));
      case "created_newest":
        return sorted.sort((a, b) =>
          (b.created_at || "").localeCompare(a.created_at || ""),
        );
      case "created_oldest":
        return sorted.sort((a, b) =>
          (a.created_at || "").localeCompare(b.created_at || ""),
        );
      default:
        return sorted;
    }
  }

  function handleSortChange(value: string) {
    setSortBy(value);
    setCourses((prev) => sortCourses(prev, value));
  }

  async function handleDelete(courseId: string) {
    const confirm = window.confirm(
      "Are you sure you want to delete this course?",
    );
    if (!confirm) return;

    try {
      await api.delete(`/courses/${courseId}`);
      toast.success("Course deleted!");
      fetchCourses();
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
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-xl font-semibold">All Courses</h1>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto sm:items-center">
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

      {/* Sort Dropdown with Label */}
      <div className="flex items-center gap-2 w-full sm:w-auto">
        <span className="text-sm font-medium text-gray-700">Sort:</span>
        <Select value={sortBy} onValueChange={handleSortChange}>
          <SelectTrigger className="w-full sm:w-[200px] capitalize">
            {sortBy
              .replace("title_asc", "Title (A–Z)")
              .replace("title_desc", "Title (Z–A)")
              .replace("created_newest", "Date Created (Newest)")
              .replace("created_oldest", "Date Created (Oldest)")}
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="title_asc">Title (A–Z)</SelectItem>
            <SelectItem value="title_desc">Title (Z–A)</SelectItem>
            <SelectItem value="created_newest">
              Date Created (Newest)
            </SelectItem>
            <SelectItem value="created_oldest">
              Date Created (Oldest)
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

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
