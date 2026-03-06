"use client";

import { Suspense, useState } from "react";
import { useForm } from "react-hook-form";
import { useRegisterLogin } from "@/features/auth/hooks/useRegisterLogin";
import AuthPageShell from "@/features/auth/components/AuthPageShell";
import { getAuthEmailRules, getAuthPasswordRules } from "@/shared/lib/auth-form-rules";
import {
  buildSouthAmericaPhone,
  DEFAULT_SOUTH_AMERICA_DIAL_CODE,
  SOUTH_AMERICA_PHONE_OPTIONS,
} from "@/shared/lib/south-america-phone";
import type { RegisterFormValues } from "@/types/auth";
import { useSearchParams } from "next/navigation";

function RegisterPageContent() {
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/products";

  const {
    register,
    handleSubmit,
    getValues,
    setValue,
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

  const [dialCode, setDialCode] = useState(DEFAULT_SOUTH_AMERICA_DIAL_CODE);
  const [localPhone, setLocalPhone] = useState("");

  const { loading, error, googleContainerRef, submitWithPassword } =
    useRegisterLogin({ mode: "register", getRegisterValues: getValues, redirectTo: redirect });

  return (
    <AuthPageShell
      title="Registro"
      error={error}
      googleContainerRef={googleContainerRef}
      footerText="¿Ya tenes cuenta?"
      footerHref={`/login?redirect=${encodeURIComponent(redirect)}`}
      footerLinkLabel="Inicia sesion"
    >
      <form onSubmit={handleSubmit((values) => submitWithPassword(values))} className="space-y-3">
        <div>
          <label className="mb-1 block text-sm text-dark-gray">Nombre</label>
          <input
            className="app-input"
            placeholder="Ej: Juan Perez"
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
          <label className="mb-1 block text-sm text-dark-gray">Telefono</label>
          <div className="grid grid-cols-[150px_minmax(0,1fr)] gap-2">
            <select
              className="app-input"
              value={dialCode}
              onChange={(event) => {
                const nextDialCode = event.target.value;
                setDialCode(nextDialCode);
                setValue("telefono", buildSouthAmericaPhone(nextDialCode, localPhone));
              }}
            >
              {SOUTH_AMERICA_PHONE_OPTIONS.map((option) => (
                <option key={option.dialCode} value={option.dialCode}>
                  {option.country} ({option.dialCode})
                </option>
              ))}
            </select>

            <input
              className="app-input"
              inputMode="numeric"
              placeholder="Ej: 3511234567"
              value={localPhone}
              onChange={(event) => {
                const nextLocalPhone = event.target.value.replace(/\D/g, "");
                setLocalPhone(nextLocalPhone);
                setValue("telefono", buildSouthAmericaPhone(dialCode, nextLocalPhone));
              }}
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm text-dark-gray">Contrasena</label>
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

export default function RegisterPageClient() {
  return (
    <Suspense fallback={null}>
      <RegisterPageContent />
    </Suspense>
  );
}
