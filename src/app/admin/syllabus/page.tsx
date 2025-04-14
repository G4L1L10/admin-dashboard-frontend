"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import api from "@/lib/api";

function KpiCard({ title, value }: { title: string; value: string | number }) {
  return (
    <div className="rounded-lg border bg-white p-6 shadow-sm flex flex-col justify-center items-center">
      <h3 className="text-sm font-medium text-gray-500 mb-2">{title}</h3>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
}

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState({
    courses: 0,
    lessons: 0,
    questions: 0,
    tags: 0,
  });

  const [loading, setLoading] = useState(true);

  async function fetchStats() {
    try {
      const res = await api.get("/stats");
      setStats(res.data);
    } catch (error) {
      console.error("Failed to fetch stats:", error);
      toast.error("Failed to load dashboard stats. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchStats();

    const interval = setInterval(() => {
      fetchStats(); // Refresh every 60 seconds
    }, 60000);

    return () => clearInterval(interval); // Cleanup
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-6 min-h-[50vh]">
        <Loader2 className="h-10 w-10 animate-spin text-gray-600" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Top Row: Buttons */}
      <div className="flex justify-end gap-4">
        <Button variant="outline" onClick={() => router.push("/admin/courses")}>
          View All Courses
        </Button>
        <Button onClick={() => router.push("/admin/courses/create")}>
          Create New Course
        </Button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard title="Total Courses" value={stats.courses} />
        <KpiCard title="Total Lessons" value={stats.lessons} />
        <KpiCard title="Total Questions" value={stats.questions} />
        <KpiCard title="Total Tags" value={stats.tags} />
      </div>
    </div>
  );
}
