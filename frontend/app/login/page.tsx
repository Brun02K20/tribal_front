"use client";

import { Suspense } from "react";
import { useForm } from "react-hook-form";
import { useRegisterLogin } from "@/features/auth/hooks/useRegisterLogin";
import AuthPageShell from "@/features/auth/components/AuthPageShell";
import { getAuthEmailRules, getAuthPasswordRules } from "@/shared/lib/auth-form-rules";
import type { LoginFormValues } from "@/types/auth";
import { useSearchParams } from "next/navigation";

function LoginPageContent() {
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
        <div>
          <label className="mb-1 block text-sm text-dark-gray">Email</label>
        <input
          className="app-input"
          type="email"
          placeholder="Ej: juan.perez@mail.com"
          {...register("email", getAuthEmailRules<LoginFormValues, "email">())}
        />
        </div>
        {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}

        <div>
          <label className="mb-1 block text-sm text-dark-gray">Contraseña</label>
        <input
          className="app-input"
          type="password"
          placeholder="Ej: MiClave123"
          {...register("password", getAuthPasswordRules<LoginFormValues, "password">())}
        />
        </div>
        {errors.password && <p className="text-sm text-red-600">{errors.password.message}</p>}

        <button className="app-btn-primary w-full" type="submit" disabled={loading}>
          {loading ? "Ingresando..." : "Ingresar"}
        </button>
      </form>
    </AuthPageShell>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginPageContent />
    </Suspense>
  );
}

