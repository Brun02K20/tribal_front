"use client";

import Link from "next/link";
import AdminOnly from "@/features/admin/components/AdminOnly";
import AdminShell from "@/features/admin/components/AdminShell";
import PedidoDetailContent from "@/features/pedidos/components/PedidoDetailContent";
import { usePedidoDetalleAdminPage } from "@/features/admin/hooks/usePedidoDetalleAdminPage";

export default function PedidoDetalleAdminPage() {
  const { id, pedido, loading, error } = usePedidoDetalleAdminPage();

  return (
    <AdminOnly>
      <AdminShell title={`Detalle de pedido #${Number.isFinite(id) ? id : "-"}`}>
        <div className="mb-4">
          <Link href="/dashboard/pedidos" className="app-btn-secondary">
            Volver a pedidos
          </Link>
        </div>

        {loading && <p className="app-subtitle">Cargando detalle del pedido...</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}

        {!loading && !error && pedido && (
          <PedidoDetailContent pedido={pedido} />
        )}
      </AdminShell>
    </AdminOnly>
  );
}

