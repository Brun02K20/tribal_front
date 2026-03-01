"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import AdminOnly from "@/features/admin/components/AdminOnly";
import AdminShell from "@/features/admin/components/AdminShell";
import PedidoDetailContent from "@/features/pedidos/components/PedidoDetailContent";
import { usePedidoAdminDetail } from "@/features/admin/hooks/usePedidoAdminDetail";

export default function PedidoDetalleAdminPage() {
  const params = useParams<{ id: string }>();
  const id = Number(params?.id);
  const { pedido, loading, error } = usePedidoAdminDetail(id);

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

