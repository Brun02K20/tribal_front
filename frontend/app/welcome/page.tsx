"use client";

import { useRouter } from "next/navigation";
import ProtectedRoute from "@/shared/providers/ProtectedRoute";
import { useAuth } from "@/shared/providers/AuthContext";

export default function WelcomePage() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <ProtectedRoute>
      <main className="app-page">
        <section className="app-container app-panel mx-auto flex max-w-md flex-col justify-center gap-4 p-6">
        <h1 className="app-title text-3xl">Bienvenido{user?.nombre ? `, ${user.nombre}` : ""} 👋</h1>
        <p className="app-subtitle">Tu sesión fue iniciada correctamente.</p>
        <button onClick={handleLogout} className="app-btn-secondary">
          Cerrar sesión
        </button>
        </section>
      </main>
    </ProtectedRoute>
  );
}

