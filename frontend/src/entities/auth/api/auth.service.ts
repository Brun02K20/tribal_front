import apiClient, { parseApiError } from "@/shared/api/apiClient";
import type {
  AuthResponse,
  GoogleRegisterPayload,
  LoginPayload,
  RegisterPayload,
} from "@/types/auth";

export const authService = {
  async login(payload: LoginPayload) {
    try {
      const { data } = await apiClient.post<AuthResponse>("/auth/login", payload);
      return data;
    } catch (error) {
      throw parseApiError(error, {
        fallbackMessage: "No se pudo iniciar sesión",
        prefix: "Autenticación",
      });
    }
  },

  async register(payload: RegisterPayload) {
    try {
      const { data } = await apiClient.post<AuthResponse>("/auth/register", payload);
      return data;
    } catch (error) {
      throw parseApiError(error, {
        fallbackMessage: "No se pudo registrar el usuario",
        prefix: "Autenticación",
      });
    }
  },

  async loginWithGoogle(idToken: string) {
    try {
      const { data } = await apiClient.post<AuthResponse>("/auth/google/login", { idToken });
      return data;
    } catch (error) {
      throw parseApiError(error, {
        fallbackMessage: "No se pudo iniciar sesión con Google",
        prefix: "Autenticación",
      });
    }
  },

  async registerWithGoogle(payload: GoogleRegisterPayload) {
    try {
      const { data } = await apiClient.post<AuthResponse>("/auth/google/register", payload);
      return data;
    } catch (error) {
      throw parseApiError(error, {
        fallbackMessage: "No se pudo registrar con Google",
        prefix: "Autenticación",
      });
    }
  },
};
