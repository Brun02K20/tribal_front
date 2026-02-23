import apiClient from "./apiClient";
import type {
  AuthResponse,
  GoogleRegisterPayload,
  LoginPayload,
  RegisterPayload,
} from "@/types/auth";

export const authService = {
  async login(payload: LoginPayload) {
    const { data } = await apiClient.post<AuthResponse>("/auth/login", payload);
    return data;
  },

  async register(payload: RegisterPayload) {
    const { data } = await apiClient.post<AuthResponse>("/auth/register", payload);
    return data;
  },

  async loginWithGoogle(idToken: string) {
    const { data } = await apiClient.post<AuthResponse>("/auth/google/login", { idToken });
    return data;
  },

  async registerWithGoogle(payload: GoogleRegisterPayload) {
    const { data } = await apiClient.post<AuthResponse>("/auth/google/register", payload);
    return data;
  },
};
