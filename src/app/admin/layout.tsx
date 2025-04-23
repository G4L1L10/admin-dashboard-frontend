// src/app/admin/layout.tsx (Server Component — no "use client")
import "@/styles/globals.css";
import Sidebar from "@/components/sidebar";
import Navbar from "@/components/navbar";
import { Toaster } from "sonner";
import AuthGuard from "@/components/auth-guard"; // 👈 Step 2 below

export const metadata = {
  title: "Bandroom Admin Dashboard",
  description: "Manage your Bandroom platform easily.",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
