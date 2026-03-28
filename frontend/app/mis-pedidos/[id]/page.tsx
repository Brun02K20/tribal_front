"use client";

import Link from "next/link";
import ProtectedRoute from "@/shared/providers/ProtectedRoute";
import PedidoDetailContent from "@/features/pedidos/components/PedidoDetailContent";
import { useMiPedidoDetallePage } from "@/features/pedidos/hooks/useMiPedidoDetallePage";

export default function MiPedidoDetallePage() {
  const { pedido, loading, error } = useMiPedidoDetallePage();

  return (
    <ProtectedRoute>
      <main className="app-page">
        <section className="app-container mx-auto max-w-360">
          <div className="mb-4">
            <Link href="/mis-pedidos" className="app-btn-secondary">
              Volver a mis pedidos
            </Link>
          </div>

          {loading && <p className="app-subtitle">Cargando detalle del pedido...</p>}
          {error && <p className="text-sm text-red-600">{error}</p>}

          {!loading && !error && pedido && <PedidoDetailContent pedido={pedido} />}
        </section>
      </main>
    </ProtectedRoute>
  );
}

