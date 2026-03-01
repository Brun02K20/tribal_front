"use client";

import ProtectedRoute from "@/src/context/ProtectedRoute";
import { useAuth } from "@/src/context/AuthContext";
import ErrorState from "@/src/components/ui/ErrorState";
import LoadingState from "@/src/components/ui/LoadingState";
import PedidosTable from "@/src/components/pedidos/PedidosTable";
import { useMisPedidos } from "@/src/hooks/useMisPedidos";

export default function MisPedidosPage() {
  const { user } = useAuth();
  const { pedidos, loading, error } = useMisPedidos();

  return (
    <ProtectedRoute>
      <main className="app-page">
        <section className="app-container mx-auto max-w-6xl">
          <header className="mb-6">
            <h1 className="app-title text-2xl">Mis pedidos</h1>
            <p className="app-subtitle mt-2">
              Historial de compras de {user?.nombre ?? "tu cuenta"}.
            </p>
          </header>

          {loading && <LoadingState message="Cargando tus pedidos..." />}
          {error && <ErrorState message={error} className="mb-4 text-sm text-red-600" />}

          {!loading && !error && (
            <PedidosTable
              pedidos={pedidos}
              loading={false}
              emptyText="Aún no registrás pedidos."
              enableDetailLink
              detailBasePath="/mis-pedidos"
            />
          )}
        </section>
      </main>
    </ProtectedRoute>
  );
}
