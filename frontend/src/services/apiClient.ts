import axios from "axios";

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001",
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  if (typeof window === "undefined") {
    return config;
  }

  try {
    const raw = window.localStorage.getItem("auth.session");
    if (!raw) {
      return config;
    }

    const parsed = JSON.parse(raw) as { token?: string };
    if (parsed?.token) {
      config.headers.Authorization = `Bearer ${parsed.token}`;
    }
  } catch {
    window.localStorage.removeItem("auth.session");
  }

  return config;
});

export default apiClient;
