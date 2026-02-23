"use client";

import { useRouter } from "next/navigation";
import ProtectedRoute from "@/src/context/ProtectedRoute";
import { useAuth } from "@/src/context/AuthContext";

export default function WelcomePage() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <ProtectedRoute>
      <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-4 p-6">
        <h1 className="text-3xl font-bold">Bienvenido{user?.nombre ? `, ${user.nombre}` : ""} 👋</h1>
        <p className="text-zinc-600">Tu sesión fue iniciada correctamente.</p>
        <button onClick={handleLogout} className="rounded-md border px-4 py-2">
          Cerrar sesión
        </button>
      </main>
    </ProtectedRoute>
  );
}
