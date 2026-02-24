"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { useRegisterLogin } from "@/src/hooks/useRegisterLogin";
import type { LoginFormValues } from "@/types/auth";
import { useRouter } from 'next/navigation';
import { paymentsService } from "@/src/services/payments/payments.service";

export default function LoginPage() {
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
  const { loading, error, googleContainerRef, submitWithPassword, setupGoogleButton } =
    useRegisterLogin({ mode: "login" });

    const router = useRouter();

    const handleMPRedirect = async () => {
      const mp_link = await paymentsService.createPaymentPreference(1, 1); // Reemplaza con guestId y productId reales
      router.push(mp_link); // Redirige a la página de pago de MercadoPago
    }

  useEffect(() => {
    return setupGoogleButton();
  }, [setupGoogleButton]);

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center p-6">
      <h1 className="mb-4 text-2xl font-bold">Login</h1>
      <form onSubmit={handleSubmit((values) => submitWithPassword(values))} className="space-y-3">
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
          type="password"
          placeholder="Password"
          {...register("password", {
            required: "La contraseña es obligatoria",
            minLength: { value: 6, message: "Mínimo 6 caracteres" },
          })}
        />
        {errors.password && <p className="text-sm text-red-600">{errors.password.message}</p>}
        <button className="w-full rounded-md bg-black p-2 text-white" type="submit" disabled={loading}>
          {loading ? "Ingresando..." : "Ingresar"}
        </button>
      </form>

      <div className="my-4 text-center text-sm text-zinc-500">o</div>
      <div ref={googleContainerRef} className="flex justify-center" />

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      <p className="mt-6 text-sm">
        ¿No tenés cuenta? <Link href="/register" className="underline">Registrate</Link>
      </p>

      <button className="mt-4 w-full rounded-md bg-gray-200 p-2 text-black" onClick={handleMPRedirect}>
        Pagar con MercadoPago
      </button>
    </main>
  );
}
