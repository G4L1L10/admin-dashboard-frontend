"use client";

import { useEffect, useState } from "react";
import { getUserEmail, logout } from "@/lib/auth";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

function getInitialsFromEmail(email: string | null): string {
  if (!email) return "BR";
  const namePart = email.split("@")[0]; // "alice.smith"
  const parts = namePart.split(/[\.\_\-]/); // split on dot, underscore, dash
  if (parts.length >= 2) {
    return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase(); // "AS"
  }
  return namePart.slice(0, 2).toUpperCase(); // fallback: "AL"
}

export default function Navbar() {
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    setEmail(getUserEmail());
  }, []);

  const initials = getInitialsFromEmail(email);

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-white shadow-sm">
      <div className="text-xl font-bold">BR</div>

      <div className="flex items-center space-x-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center cursor-pointer">
              <span className="text-gray-700 font-semibold">{initials}</span>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {email && (
              <div className="px-3 py-2 text-sm text-gray-700 border-b">
                {email}
              </div>
            )}
            <DropdownMenuItem
              className="cursor-pointer text-gray-700"
              onClick={logout}
            >
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
