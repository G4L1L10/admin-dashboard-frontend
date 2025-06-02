"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  refreshAccessToken,
  getAccessToken,
  setAccessToken,
  getUserRole,
} from "@/lib/auth";

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function init() {
      console.log("🌀 Attempting to refresh access token...");

      const ok = await refreshAccessToken(); // this returns a boolean

      if (!ok) {
        console.log("❌ Refresh failed. Redirecting to /login");
        router.push("/login");
        return;
      }

      const token = getAccessToken();
      if (!token) {
        console.log("❌ No token after refresh. Redirecting.");
        router.push("/login");
        return;
      }

      setAccessToken(token);
      const role = getUserRole();
      console.log("🔓 Role from token:", role);

      if (role !== "admin") {
        console.log("⛔ Not admin. Redirecting to /unauthorized");
        router.push("/unauthorized");
        return;
      }

      console.log("✅ Authenticated as admin. Rendering dashboard.");
      setLoading(false);
    }

    init();
  }, [router]);

  if (loading) {
    return <div className="p-6 text-gray-500">Loading...</div>;
  }

  return (
    <div className="flex items-center justify-center h-full p-6 text-gray-500">
      Welcome to Bandroom Admin Dashboard
    </div>
  );
}
