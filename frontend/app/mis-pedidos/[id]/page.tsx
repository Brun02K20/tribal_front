"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import ProtectedRoute from "@/shared/providers/ProtectedRoute";
import { useAuth } from "@/shared/providers/AuthContext";
import PedidoDetailContent from "@/features/pedidos/components/PedidoDetailContent";
import { usePedidoDetail } from "@/features/pedidos/hooks/usePedidoDetail";

export default function MiPedidoDetallePage() {
  const { user } = useAuth();
  const params = useParams<{ id: string }>();
  const id = Number(params?.id);

  const { pedido, loading, error } = usePedidoDetail({
    id,
    expectedUserId: user?.id,
  });

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

