import axios, { AxiosError } from "axios";
import { findSuspiciousInputPaths } from "@/shared/lib/security/xss";

type ParseApiErrorOptions = {
  fallbackMessage?: string;
  prefix?: string;
};

type ApiErrorPayload = {
  message?: string | string[];
  error?: string;
  statusCode?: number;
};

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  const method = (config.method ?? "get").toLowerCase();
  if (["post", "put", "patch"].includes(method)) {
    const suspiciousPaths = findSuspiciousInputPaths(config.data);
    if (suspiciousPaths.length) {
      throw new Error(
        `Entrada rechazada por seguridad. Campos sospechosos: ${suspiciousPaths.join(", ")}`,
      );
    }
  }

  return config;
});

export const parseApiError = (
  error: unknown,
  options?: ParseApiErrorOptions,
): Error => {
  const fallbackMessage = options?.fallbackMessage ?? "Error en la comunicación con la API";
  const prefix = options?.prefix?.trim();
  const axiosError = error as AxiosError<ApiErrorPayload>;

  if (error instanceof Error && !axiosError.response) {
    const message = error.message || fallbackMessage;
    return new Error(prefix ? `${prefix}: ${message}` : message);
  }

  const payload = axiosError.response?.data;
  if (payload) {
    const messageFromMessage = Array.isArray(payload.message)
      ? payload.message.join(", ")
      : payload.message;
    const baseMessage = messageFromMessage || payload.error || fallbackMessage;
    const statusPrefix = payload.statusCode ? `[${payload.statusCode}] ` : "";
    const finalMessage = `${statusPrefix}${baseMessage}`;
    return new Error(prefix ? `${prefix}: ${finalMessage}` : finalMessage);
  }

  return new Error(prefix ? `${prefix}: ${fallbackMessage}` : fallbackMessage);
}

export default apiClient;

