// src/lib/api.ts

import axios from "axios";

let accessToken: string | null = null;

// ✅ Set access token in memory
export function setAccessToken(token: string) {
  accessToken = token;
}

// ✅ Get access token (optional debug)
export function getAccessToken(): string | null {
  return accessToken;
}

// ✅ Refresh token using cookie (must match backend: POST /auth/refresh)
export async function refreshAccessToken(): Promise<string | null> {
  try {
    const response = await axios.post(
      "http://localhost:8081/auth/refresh", // ✅ Must be POST to match Go route
      null, // ✅ No body needed
      { withCredentials: true }, // ✅ Send HttpOnly cookie
    );

    const token = response.data.access_token;
    setAccessToken(token); // ✅ Store in memory
    return token;
  } catch (err) {
    console.error("❌ Failed to refresh access token", err);
    return null;
  }
}

// ✅ Axios instance for all protected APIs
const api = axios.create({
  baseURL: "http://localhost:8080/api",
  timeout: 5000,
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ Attach token automatically on requests
api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers = config.headers || {};
    config.headers["Authorization"] = `Bearer ${accessToken}`;
  }
  return config;
});

export default api;
