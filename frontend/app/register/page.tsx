"use client";

import { useForm } from "react-hook-form";
import { useRegisterLogin } from "@/src/hooks/useRegisterLogin";
import AuthPageShell from "@/src/components/auth/AuthPageShell";
import { getAuthEmailRules, getAuthPasswordRules } from "@/src/utils/auth-form-rules";
import type { RegisterFormValues } from "@/types/auth";
import { useSearchParams } from "next/navigation";

export default function RegisterPage() {
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/products";

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    defaultValues: {
      nombre: "",
      username: "",
      email: "",
      telefono: "",
      password: "",
    },
  });
  const { loading, error, googleContainerRef, submitWithPassword } =
    useRegisterLogin({ mode: "register", getRegisterValues: getValues, redirectTo: redirect });

  return (
    <AuthPageShell
      title="Registro"
      error={error}
      googleContainerRef={googleContainerRef}
      footerText="¿Ya tenés cuenta?"
      footerHref={`/login?redirect=${encodeURIComponent(redirect)}`}
      footerLinkLabel="Iniciá sesión"
    >
      <form onSubmit={handleSubmit((values) => submitWithPassword(values))} className="space-y-3">
        <input
          className="app-input"
          placeholder="Nombre"
          {...register("nombre", { required: "El nombre es obligatorio" })}
        />
        {errors.nombre && <p className="text-sm text-red-600">{errors.nombre.message}</p>}

        <input className="app-input" placeholder="Username" {...register("username")} />

        <input
          className="app-input"
          type="email"
          placeholder="Email"
          {...register("email", getAuthEmailRules<RegisterFormValues, "email">())}
        />
        {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}

        <input className="app-input" placeholder="Teléfono" {...register("telefono")} />

        <input
          className="app-input"
          type="password"
          placeholder="Password"
          {...register("password", getAuthPasswordRules<RegisterFormValues, "password">())}
        />
        {errors.password && <p className="text-sm text-red-600">{errors.password.message}</p>}

        <button className="app-btn-primary w-full" type="submit" disabled={loading}>
          {loading ? "Registrando..." : "Crear cuenta"}
        </button>
      </form>
    </AuthPageShell>
  );
}
