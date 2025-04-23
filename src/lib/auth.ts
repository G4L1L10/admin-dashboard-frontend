import { jwtDecode } from "jwt-decode";

export function isLoggedIn(): boolean {
  if (typeof window === "undefined") return false;
  return !!localStorage.getItem("access_token");
}

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("access_token");
}

export function setAccessToken(token: string) {
  if (typeof window !== "undefined") {
    localStorage.setItem("access_token", token);
  }
}

export function logout() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("access_token");
    window.location.href = "/login";
  }
}

interface TokenPayload {
  email?: string;
  user_id?: string;
  exp?: number;
  iat?: number;
}

/**
 * Get the email of the logged in user from the access token.
 */
export function getUserEmail(): string | null {
  const token = getAccessToken();
  if (!token) return null;

  try {
    const decoded = jwtDecode<TokenPayload>(token);
    return decoded.email || null;
  } catch (err) {
    console.error("Failed to decode token", err);
    return null;
  }
}
