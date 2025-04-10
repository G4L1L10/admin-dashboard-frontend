// src/app/admin/layout.tsx
import "@/styles/globals.css";
import Sidebar from "@/components/sidebar";
import Navbar from "@/components/navbar";

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
    <html lang="en">
      <body>
        {/* Wrap your app inside a div */}
        <div className="flex min-h-screen bg-gray-100">
          {/* Sidebar */}
          <Sidebar />

          {/* Main Content */}
          <div className="flex flex-col flex-1">
            <Navbar />
            <main className="flex-1 p-6">{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}
