"use client";

import { useForm } from "react-hook-form";
import { useRegisterLogin } from "@/src/hooks/useRegisterLogin";
import AuthPageShell from "@/src/components/auth/AuthPageShell";
import { getAuthEmailRules, getAuthPasswordRules } from "@/src/utils/auth-form-rules";
import type { LoginFormValues } from "@/types/auth";
import { useSearchParams } from "next/navigation";

export default function LoginPage() {
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/products";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    defaultValues: {
      email: "",
      password: "",
    },
  });
  const { loading, error, googleContainerRef, submitWithPassword } =
    useRegisterLogin({ mode: "login", redirectTo: redirect });

  return (
    <AuthPageShell
      title="Login"
      error={error}
      googleContainerRef={googleContainerRef}
      footerText="¿No tenés cuenta?"
      footerHref={`/register?redirect=${encodeURIComponent(redirect)}`}
      footerLinkLabel="Registrate"
    >
      <form onSubmit={handleSubmit((values) => submitWithPassword(values))} className="space-y-3">
        <input
          className="app-input"
          type="email"
          placeholder="Email"
          {...register("email", getAuthEmailRules<LoginFormValues, "email">())}
        />
        {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}

        <input
          className="app-input"
          type="password"
          placeholder="Password"
          {...register("password", getAuthPasswordRules<LoginFormValues, "password">())}
        />
        {errors.password && <p className="text-sm text-red-600">{errors.password.message}</p>}

        <button className="app-btn-primary w-full" type="submit" disabled={loading}>
          {loading ? "Ingresando..." : "Ingresar"}
        </button>
      </form>
    </AuthPageShell>
  );
}
