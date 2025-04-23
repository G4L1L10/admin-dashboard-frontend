"use client";

import { useEffect, useState } from "react";
import { getUserEmail, logout } from "@/lib/auth";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

export default function Navbar() {
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    setEmail(getUserEmail());
  }, []);

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-white shadow-sm">
      <div className="text-xl font-bold">BR</div>

      <div className="flex items-center space-x-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center cursor-pointer">
              <span className="text-gray-700 font-semibold">BA</span>
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
