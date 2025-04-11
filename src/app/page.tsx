// src/app/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 px-4 text-center">
      <h1 className="text-4xl font-bold mb-6">
        Welcome to{" "}
        <span className="text-blue-600">Bandroom Admin Dashboard</span>
      </h1>
      <p className="text-gray-600 text-lg mb-8">
        Manage your users, projects, analytics, and settings seamlessly.
      </p>
      <Button onClick={() => router.push("/admin/dashboard")}>
        Go to Admin
      </Button>
    </div>
  );
}
