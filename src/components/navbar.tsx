// src/components/navbar.tsx
"use client";

export default function Navbar() {
  return (
    <header className="flex items-center justify-between px-6 py-4 bg-white shadow-sm">
      {/* Left: Logo */}
      <div className="text-xl font-bold text-blue-600">Admin</div>

      {/* Right: User Profile */}
      <div className="flex items-center space-x-4">
        {/* Placeholder for future notifications */}
        {/* <BellIcon className="w-6 h-6 text-gray-500" /> */}

        {/* Profile avatar */}
        <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
          <span className="text-gray-700 font-semibold">BA</span>{" "}
          {/* BA = Bandroom Admin */}
        </div>
      </div>
    </header>
  );
}
