"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { useRegisterLogin } from "@/src/hooks/useRegisterLogin";
import type { RegisterFormValues } from "@/types/auth";

export default function RegisterPage() {
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
  const { loading, error, googleContainerRef, submitWithPassword, setupGoogleButton } =
    useRegisterLogin({ mode: "register", getRegisterValues: getValues });

  useEffect(() => {
    return setupGoogleButton();
  }, [setupGoogleButton]);

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center p-6">
      <h1 className="mb-4 text-2xl font-bold">Registro</h1>

      <form onSubmit={handleSubmit((values) => submitWithPassword(values))} className="space-y-3">
        <input
          className="w-full rounded-md border p-2"
          placeholder="Nombre"
          {...register("nombre", { required: "El nombre es obligatorio" })}
        />
        {errors.nombre && <p className="text-sm text-red-600">{errors.nombre.message}</p>}
        <input
          className="w-full rounded-md border p-2"
          placeholder="Username"
          {...register("username")}
        />
        <input
          className="w-full rounded-md border p-2"
          type="email"
          placeholder="Email"
          {...register("email", {
            required: "El email es obligatorio",
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: "Ingresá un email válido",
            },
          })}
        />
        {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
        <input
          className="w-full rounded-md border p-2"
          placeholder="Teléfono"
          {...register("telefono")}
        />
        <input
          className="w-full rounded-md border p-2"
          type="password"
          placeholder="Password"
          {...register("password", {
            required: "La contraseña es obligatoria",
            minLength: { value: 6, message: "Mínimo 6 caracteres" },
          })}
        />
        {errors.password && <p className="text-sm text-red-600">{errors.password.message}</p>}

        <button className="w-full rounded-md bg-black p-2 text-white" type="submit" disabled={loading}>
          {loading ? "Registrando..." : "Crear cuenta"}
        </button>
      </form>

      <div className="my-4 text-center text-sm text-zinc-500">o</div>
      <div ref={googleContainerRef} className="flex justify-center" />

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      <p className="mt-6 text-sm">
        ¿Ya tenés cuenta? <Link href="/login" className="underline">Iniciá sesión</Link>
      </p>
    </main>
  );
}
