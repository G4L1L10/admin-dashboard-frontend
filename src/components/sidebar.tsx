// src/components/sidebar.tsx
"use client";

import Link from "next/link";

const navItems = [
  { name: "Analytics", href: "/admin/analytics" },
  { name: "Dashboard", href: "/admin/dashboard" },
  { name: "Users", href: "/admin/users" },
  { name: "Projects", href: "/admin/projects" },
  { name: "Syllabus", href: "/admin/syllabus" },
  { name: "Settings", href: "/admin/settings" },
];

export default function Sidebar() {
  return (
    <div className="w-64 bg-white shadow-md min-h-screen p-6">
      <h2 className="text-2xl font-bold text-gray-700-600 mb-10">BR</h2>
      <nav className="flex flex-col space-y-4">
        {navItems.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className="text-gray-700 hover:bg-gray-100 p-2 rounded"
          >
            {item.name}
          </Link>
        ))}
      </nav>
    </div>
  );
}
