// src/lib/auth.ts
import { jwtDecode } from "jwt-decode";

interface TokenPayload {
  email?: string;
  user_id?: string;
  role?: string;
  exp?: number;
  iat?: number;
}

// 👇 In-memory access token
let accessTokenMemory: string | null = null;

export function setAccessToken(token: string) {
  accessTokenMemory = token;
}

export function getAccessToken(): string | null {
  return accessTokenMemory;
}

/**
 * Refresh the access token using the HttpOnly refresh cookie.
 * Returns the new access token string if successful, or null if failed.
 */
export async function refreshAccessToken(): Promise<boolean> {
  try {
    const res = await fetch("http://localhost:8081/auth/refresh", {
      method: "POST",
      credentials: "include", // ✅ cookie must be sent
    });

    const data = await res.json();
    console.log("🔁 Refresh response:", res.status, data); // 👈 add this

    if (res.ok && data.access_token) {
      setAccessToken(data.access_token);
      return true;
    }

    return false;
  } catch (error) {
    console.error("❌ Failed to refresh access token", error);
    return false;
  }
}

/**
 * Extract user email from decoded JWT.
 */
export function getUserEmail(): string | null {
  const token = getAccessToken();
  if (!token) return null;

  try {
    const decoded = jwtDecode<TokenPayload>(token);
    return decoded.email || null;
  } catch {
    return null;
  }
}

/**
 * Extract user role from decoded JWT.
 */
export function getUserRole(): string | null {
  const token = getAccessToken();
  if (!token) return null;

  try {
    const decoded = jwtDecode<TokenPayload>(token);
    return decoded.role || null;
  } catch {
    return null;
  }
}

/**
 * Logout by clearing refresh token cookie on server and redirect to login.
 */
export function logout() {
  fetch("http://localhost:8081/auth/logout", {
    method: "POST",
    credentials: "include", // send refresh cookie
  }).finally(() => {
    window.location.href = "/login";
  });
}
