"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/shared/providers/ProtectedRoute";
import { useAuth } from "@/shared/providers/AuthContext";
import { IconArrowRight } from "@/shared/ui/Icons";

export default function WelcomePageClient() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <ProtectedRoute>
      <main className="mx-auto flex w-full max-w-lg flex-col items-center gap-4 px-4 py-16 text-center">
        <p className="app-kicker">Sesión iniciada</p>
        <h1 className="app-display text-4xl">Hola{user?.nombre ? `, ${user.nombre}` : ""}</h1>
        <p className="text-dark-gray">Ya podés comprar, seguir tus pedidos y encargar piezas personalizadas.</p>
        <div className="mt-2 flex flex-wrap justify-center gap-3">
          <Link href="/products" className="app-btn-cta">
            Ir a la tienda <IconArrowRight className="h-4 w-4" />
          </Link>
          <button onClick={handleLogout} className="app-btn-outline">
            Cerrar sesión
          </button>
        </div>
      </main>
    </ProtectedRoute>
  );
}
