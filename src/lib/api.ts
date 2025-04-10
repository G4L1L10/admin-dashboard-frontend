// src/lib/api.ts
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080/api", // <-- Your Go backend base URL
  timeout: 5000,
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
