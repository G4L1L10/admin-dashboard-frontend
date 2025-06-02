"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { refreshAccessToken, getUserRole, logout } from "@/lib/auth";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    async function verifyAccess() {
      const success = await refreshAccessToken();

      if (!success) {
        logout();
        return;
      }

      const role = getUserRole();

      if (role !== "admin") {
        router.replace("/unauthorized");
        return;
      }

      setAuthorized(true);
    }

    verifyAccess();
  }, [router]);

  if (!authorized) {
    return <div className="p-6 text-gray-500">Checking permissions...</div>;
  }

  return <>{children}</>;
}
