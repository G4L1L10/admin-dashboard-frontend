"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { isLoggedIn, logout } from "@/lib/auth";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    if (!isLoggedIn()) {
      logout(); // cleanup
      router.replace("/login"); // 🚪 force redirect
    }
  }, []);

  return <>{children}</>;
}
