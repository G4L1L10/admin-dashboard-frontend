// src/app/admin/layout.tsx
import "@/styles/globals.css";
import Sidebar from "@/components/sidebar";
import Navbar from "@/components/navbar";
import { Toaster } from "sonner"; // ✅ Import Toaster

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
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex flex-col flex-1">
        {/* Navbar */}
        <Navbar />

        {/* Page Content */}
        <main className="flex-1 p-6">{children}</main>
      </div>

      {/* ✅ Toast Notifications */}
      <Toaster richColors position="top-right" />
    </div>
  );
}
