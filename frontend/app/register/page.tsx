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
        <div>
          <label className="mb-1 block text-sm text-dark-gray">Nombre</label>
        <input
          className="app-input"
          placeholder="Ej: Juan Pérez"
          {...register("nombre", { required: "El nombre es obligatorio" })}
        />
        </div>
        {errors.nombre && <p className="text-sm text-red-600">{errors.nombre.message}</p>}

        <div>
          <label className="mb-1 block text-sm text-dark-gray">Username</label>
          <input className="app-input" placeholder="Ej: juanperez" {...register("username")} />
        </div>

        <div>
          <label className="mb-1 block text-sm text-dark-gray">Email</label>
        <input
          className="app-input"
          type="email"
          placeholder="Ej: juan.perez@mail.com"
          {...register("email", getAuthEmailRules<RegisterFormValues, "email">())}
        />
        </div>
        {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}

        <div>
          <label className="mb-1 block text-sm text-dark-gray">Teléfono</label>
          <input className="app-input" placeholder="Ej: 3511234567" {...register("telefono")} />
        </div>

        <div>
          <label className="mb-1 block text-sm text-dark-gray">Contraseña</label>
        <input
          className="app-input"
          type="password"
          placeholder="Ej: MiClave123"
          {...register("password", getAuthPasswordRules<RegisterFormValues, "password">())}
        />
        </div>
        {errors.password && <p className="text-sm text-red-600">{errors.password.message}</p>}

        <button className="app-btn-primary w-full" type="submit" disabled={loading}>
          {loading ? "Registrando..." : "Crear cuenta"}
        </button>
      </form>
    </AuthPageShell>
  );
}
