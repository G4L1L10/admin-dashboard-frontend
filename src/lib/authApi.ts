// src/lib/authApi.ts
import axios from "axios";

const authApi = axios.create({
  baseURL: "http://localhost:8081/auth", // Authentication backend
  timeout: 5000,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // so refresh cookies are included
});

export default authApi;
