// src/app/login/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import axios from "axios";
import { setAccessToken } from "@/lib/auth";
import type { AxiosError } from "axios";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await axios.post(
        "http://localhost:8081/auth/login",
        { email, password },
        { withCredentials: true }, // ✅ allow refresh_token cookie
      );

      const accessToken = res.data.access_token;
      if (!accessToken) {
        throw new Error("No access token returned");
      }

      setAccessToken(accessToken); // ✅ In-memory only
      toast.success("Logged in successfully!");
      router.push("/admin/dashboard");
    } catch (err: unknown) {
      console.error("Login error:", err);

      if (
        typeof err === "object" &&
        err !== null &&
        "isAxiosError" in err &&
        (err as AxiosError).isAxiosError
      ) {
        const axiosErr = err as AxiosError;
        if (axiosErr.response?.status === 401) {
          setErrorMsg("Unauthorized access: Invalid credentials");
        } else {
          setErrorMsg("Something went wrong. Please try again.");
        }
      } else {
        setErrorMsg("Unexpected error occurred.");
      }

      toast.error("Login failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <Card className="w-full max-w-sm shadow-lg border border-gray-200">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-semibold text-gray-800">
            Admin Login
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-10"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-10"
                placeholder="••••••••"
              />
            </div>

            {errorMsg && (
              <div className="text-sm text-red-700 bg-red-100 border border-red-300 p-3 rounded-md">
                {errorMsg}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Logging in..." : "Log In"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
