"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Pencil, ListChecks, BookOpen, Trash2 } from "lucide-react";
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
  created_at: string;
}

export default function CourseDetailsPage() {
  const { courseId } = useParams();
  const router = useRouter();

  const [course, setCourse] = useState<{ title: string; description: string }>({
    title: "",
    description: "",
  });

  const [lessons, setLessons] = useState<Lesson[]>([]);

  const [sortOption, setSortOption] = useState("created_newest");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [unitRangeFilter, setUnitRangeFilter] = useState("all");
  const [xpRangeFilter, setXpRangeFilter] = useState("all");
  const [crownsRangeFilter, setCrownsRangeFilter] = useState("all");

  useEffect(() => {
    async function fetchData() {
      try {
        const courseRes = await api.get(`/courses/${courseId}`);
        setCourse({
          title: courseRes.data.title,
          description: courseRes.data.description,
        });

        const lessonsRes = await api.get(`/lessons/by-course/${courseId}`);
        setLessons(lessonsRes.data || []);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load course details");
      }
    }

    if (courseId) {
      fetchData();
    }
  }, [courseId]);

  function inRange(value: number, range: string) {
    const [min, max] = range.split("-").map(Number);
    return value >= min && value <= max;
  }

  const filteredLessons = lessons.filter((lesson) => {
    const difficultyMatch =
      difficultyFilter === "all" || lesson.difficulty === difficultyFilter;

    const unitMatch =
      unitRangeFilter === "all" || inRange(lesson.unit, unitRangeFilter);

    const xpMatch =
      xpRangeFilter === "all" || inRange(lesson.xp_reward, xpRangeFilter);

    const crownsMatch =
      crownsRangeFilter === "all" || inRange(lesson.crowns_reward, crownsRangeFilter);

    return difficultyMatch && unitMatch && xpMatch && crownsMatch;
  });

  const sortedLessons = [...filteredLessons].sort((a, b) => {
    switch (sortOption) {
      case "title_asc":
        return a.title.localeCompare(b.title);
      case "title_desc":
        return b.title.localeCompare(a.title);
      case "unit":
        return a.unit - b.unit;
      case "xp":
        return b.xp_reward - a.xp_reward;
      case "created_oldest":
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      case "created_newest":
      default:
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
  });

  async function handleDeleteLesson(lessonId: string) {
    const confirmDelete = window.confirm("Are you sure you want to delete this lesson?");
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

  const handleResetFilters = () => {
    setSortOption("created_newest");
    setDifficultyFilter("all");
    setUnitRangeFilter("all");
    setXpRangeFilter("all");
    setCrownsRangeFilter("all");
  };

  return (
    <div className="flex flex-col gap-10">
      {/* Course Info Card */}
      <Card>
        <CardHeader className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold mb-3">All Lessons</h1>
            <p>
              <span className="font-semibold text-gray-600">Course title:</span> {course.title}
            </p>
            <p>
              <span className="font-semibold text-gray-600">Course description:</span> {course.description}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mt-2 sm:mt-0 items-start sm:items-center flex-wrap">
            <Button variant="outline" onClick={() => router.push("/admin/courses")}>
              <BookOpen className="h-4 w-4 mr-2" />
              All Courses
            </Button>
            <Button variant="outline" onClick={() => router.push(`/admin/courses/${courseId}/edit`)}>
              <Pencil className="h-4 w-4 mr-2" />
              Edit Course
            </Button>
            <Button onClick={() => router.push(`/admin/courses/${courseId}/lessons/create`)}>
              <span className="text-lg font-bold mr-2">+</span>
              Add Lesson
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Filters & Sorting */}
      <div className="flex flex-wrap gap-4 items-center">
        {/* Sort */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-700 font-medium">Sort:</span>
          <Select value={sortOption} onValueChange={setSortOption}>
            <SelectTrigger className="w-[220px] h-8 capitalize border-gray-300 hover:border-gray-500 focus:border-blue-600 focus:ring-1 focus:ring-blue-500">
              {sortOption
                .replace("title_asc", "Title (A - Z)")
                .replace("title_desc", "Title (Z - A)")
                .replace("unit", "Unit Number")
                .replace("xp", "XP Reward")
                .replace("created_newest", "Date Created (Newest)")
                .replace("created_oldest", "Date Created (Oldest)")}
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="title_asc">Title (A - Z)</SelectItem>
              <SelectItem value="title_desc">Title (Z - A)</SelectItem>
              <SelectItem value="unit">Unit Number</SelectItem>
              <SelectItem value="xp">XP Reward</SelectItem>
              <SelectItem value="created_newest">Date Created (Newest)</SelectItem>
              <SelectItem value="created_oldest">Date Created (Oldest)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Difficulty */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-700 font-medium">Difficulty:</span>
          <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
            <SelectTrigger className="w-[160px] h-8 capitalize border-gray-300 hover:border-gray-500 focus:border-blue-600 focus:ring-1 focus:ring-blue-500">
              {difficultyFilter === "all" ? "All" : difficultyFilter}
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="easy">Easy</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="hard">Hard</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Unit */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-700 font-medium">Unit:</span>
          <Select value={unitRangeFilter} onValueChange={setUnitRangeFilter}>
            <SelectTrigger className="w-[160px] h-8 border-gray-300 hover:border-gray-500 focus:border-blue-600 focus:ring-1 focus:ring-blue-500">
              {unitRangeFilter === "all" ? "All" : `Units ${unitRangeFilter}`}
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {["1-10", "11-20", "21-30", "31-40", "41-50", "51-60", "61-70", "71-80", "81-90", "91-100"].map((range) => (
                <SelectItem key={range} value={range}>{range}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* XP */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-700 font-medium">XP:</span>
          <Select value={xpRangeFilter} onValueChange={setXpRangeFilter}>
            <SelectTrigger className="w-[160px] h-8 border-gray-300 hover:border-gray-500 focus:border-blue-600 focus:ring-1 focus:ring-blue-500">
              {xpRangeFilter === "all" ? "All" : `XP ${xpRangeFilter}`}
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {["1-49", "50-99", "100-149", "150-199", "200-249", "250-299"].map((range) => (
                <SelectItem key={range} value={range}>{range}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Crowns */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-700 font-medium">Crowns:</span>
          <Select value={crownsRangeFilter} onValueChange={setCrownsRangeFilter}>
            <SelectTrigger className="w-[160px] h-8 border-gray-300 hover:border-gray-500 focus:border-blue-600 focus:ring-1 focus:ring-blue-500">
              {crownsRangeFilter === "all" ? "All" : `Crowns ${crownsRangeFilter}`}
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {["1-10", "11-20", "21-30", "31-40", "41-50"].map((range) => (
                <SelectItem key={range} value={range}>{range}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Reset */}
        <Button variant="outline" onClick={handleResetFilters}>
          Reset Filters
        </Button>
      </div>

      {/* Lessons Section */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Lessons</h2>

        {sortedLessons.length === 0 ? (
          <p className="text-gray-500">No lessons yet. Start by adding one!</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedLessons.map((lesson) => (
              <Card key={lesson.id}>
                <CardHeader>
                  <h3 className="text-lg font-semibold">{lesson.title}</h3>
                </CardHeader>
                <CardContent className="space-y-1">
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
                    onClick={() => router.push(`/admin/courses/${courseId}/lessons/${lesson.id}/edit`)}
                  >
                    <Pencil className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => router.push(`/admin/courses/${courseId}/lessons/${lesson.id}/questions`)}
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

