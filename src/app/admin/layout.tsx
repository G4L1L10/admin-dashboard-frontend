"use client";

import "@/styles/globals.css";
import { useEffect } from "react";
import Sidebar from "@/components/sidebar";
import Navbar from "@/components/navbar";
import { Toaster } from "sonner";
import AuthGuard from "@/components/auth-guard";
import { refreshAccessToken, setAccessToken } from "@/lib/api"; // ✅ ADD this

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    refreshAccessToken().then((token) => {
      if (token) {
        setAccessToken(token); // ✅ CRUCIAL LINE: stores token for all requests
      } else {
        console.warn("❌ Token refresh failed or user not logged in.");
      }
    });
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <div className="flex flex-col flex-1">
        <Navbar />
        <main className="flex-1 p-6">
          <AuthGuard>{children}</AuthGuard>
        </main>
      </div>
      <Toaster richColors position="top-right" />
    </div>
  );
}
