// src/lib/api.ts

import axios from "axios";
import { setAccessToken } from "./auth";

const api = axios.create({
  baseURL: "http://localhost:8080/api",
  timeout: 5000,
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ On every request, attach access_token if available
api.interceptors.request.use(async (config) => {
  const token = sessionStorage.getItem("access_token"); // Only kept in memory/session
  if (token) {
    config.headers = config.headers || {};
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
});

export async function refreshAccessToken(): Promise<void> {
  try {
    const response = await axios.post(
      "http://localhost:8081/auth/refresh",
      null,
      {
        withCredentials: true, // ✅ Sends refresh_token cookie
      },
    );

    const newToken = response.data.access_token;
    setAccessToken(newToken); // Saves it to sessionStorage
  } catch (err) {
    console.error("Refresh failed", err);
    throw new Error("Token refresh failed");
  }
}

export default api;
