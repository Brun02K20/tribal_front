"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/context/AuthContext";
import { useToast } from "@/src/context/ToastContext";
import { authService } from "@/src/services/auth/auth.service";
import type {
  AuthResponse,
  BackendErrorResponse,
  LoginFormValues,
  RegisterFormValues,
} from "@/types/auth";

type HookMode = "login" | "register";

type UseRegisterLoginParams = {
  mode: HookMode;
  getRegisterValues?: () => RegisterFormValues;
  redirectTo?: string;
};

export const useRegisterLogin = ({ mode, getRegisterValues, redirectTo }: UseRegisterLoginParams) => {
  const router = useRouter();
  const { login } = useAuth();
  const { showToast } = useToast();
  const googleContainerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parseBackendError = useCallback((err: unknown, fallback: string) => {
    const axiosError = err as AxiosError<BackendErrorResponse>;
    const backendMessage = axiosError.response?.data?.message;

    if (Array.isArray(backendMessage)) {
      return backendMessage.join(", ");
    }

    return backendMessage ?? fallback;
  }, []);

  const loginSuccess = useCallback(
    (data: AuthResponse) => {
      login({ user: data.user, token: data.token });
      showToast(
        mode === "login" ? "Sesión iniciada correctamente" : "Cuenta creada correctamente",
        "success",
      );
      const destination = data.user.id_rol === 1 ? "/dashboard" : (redirectTo || "/products");
      router.push(destination);
    },
    [login, mode, redirectTo, router, showToast],
  );

  const submitWithPassword = useCallback(
    async (values: LoginFormValues | RegisterFormValues) => {
      setError(null);
      setLoading(true);

      try {
        if (mode === "login") {
          const loginValues = values as LoginFormValues;
          const data = await authService.login(loginValues);
          loginSuccess(data);
        } else {
          const registerValues = values as RegisterFormValues;
          const data = await authService.register({
            nombre: registerValues.nombre,
            username: registerValues.username || undefined,
            email: registerValues.email,
            telefono: registerValues.telefono || undefined,
            password: registerValues.password,
          });
          loginSuccess(data);
        }
      } catch (err) {
        setError(
          parseBackendError(
            err,
            mode === "login" ? "No se pudo iniciar sesión" : "No se pudo registrar",
          ),
        );
      } finally {
        setLoading(false);
      }
    },
    [loginSuccess, mode, parseBackendError],
  );

  const submitWithGoogle = useCallback(async () => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId || !window.google || !googleContainerRef.current) {
      return;
    }

    googleContainerRef.current.innerHTML = "";

    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: async ({ credential }) => {
        if (!credential) {
          return;
        }

        setError(null);
        setLoading(true);

        try {
          if (mode === "login") {
            const data = await authService.loginWithGoogle(credential);
            loginSuccess(data);
          } else {
            const registerValues = getRegisterValues?.();
            const data = await authService.registerWithGoogle({
              idToken: credential,
              nombre: registerValues?.nombre || undefined,
              username: registerValues?.username || undefined,
              email: registerValues?.email || undefined,
              telefono: registerValues?.telefono || undefined,
            });
            loginSuccess(data);
          }
        } catch (err) {
          setError(
            parseBackendError(
              err,
              mode === "login"
                ? "No se pudo iniciar sesión con Google"
                : "No se pudo registrar con Google",
            ),
          );
        } finally {
          setLoading(false);
        }
      },
    });

    window.google.accounts.id.renderButton(googleContainerRef.current, {
      theme: "outline",
      size: "large",
      text: mode === "login" ? "signin_with" : "signup_with",
      shape: "rectangular",
    });
  }, [getRegisterValues, loginSuccess, mode, parseBackendError]);

  const setupGoogleButton = useCallback(() => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) {
      return () => undefined;
    }

    if (window.google) {
      void submitWithGoogle();
      return () => undefined;
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => {
      void submitWithGoogle();
    };
    document.body.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [submitWithGoogle]);

  useEffect(() => {
    return setupGoogleButton();
  }, [setupGoogleButton]);

  return {
    loading,
    error,
    googleContainerRef,
    submitWithPassword,
  };
};
