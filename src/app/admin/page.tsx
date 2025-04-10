// src/app/admin/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

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

  return (
    <div className="flex flex-col gap-6">
      {/* Top Row: Create Course Button */}
      <div className="flex justify-end">
        <Button onClick={() => router.push("/admin/courses/create")}>
          Create New Course
        </Button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard title="Total Courses" value={12} />
        <KpiCard title="Total Lessons" value={56} />
        <KpiCard title="Total Questions" value={230} />
        <KpiCard title="Total Tags" value={18} />
      </div>
    </div>
  );
}
