import Link from "next/link";
import AdminTable from "@/src/components/admin/AdminTable";
import { formatDateTimeEsAr } from "@/src/utils/formatters";
import { getPedidoDireccion, getPedidoTotal } from "@/src/utils/pedidos";
import type { PedidoAdmin } from "@/types/pedidos";
import type { ReactNode } from "react";

type PedidosTableProps = {
  pedidos: PedidoAdmin[];
  loading: boolean;
  emptyText: string;
  renderActions?: (pedido: PedidoAdmin) => ReactNode;
  enableDetailLink?: boolean;
  detailBasePath?: string;
};

export default function PedidosTable({
  pedidos,
  loading,
  emptyText,
  renderActions,
  enableDetailLink = false,
  detailBasePath = "/dashboard/pedidos",
}: PedidosTableProps) {
  return (
    <AdminTable
      headers={[
        "Nombre",
        "Mail",
        "Teléfono",
        "Total pagado",
        "Fecha/Hora pedido",
        "Fecha/Hora pago",
        "Estado envío",
        "Dirección entrega",
        "Acciones",
      ]}
      loading={loading}
      isEmpty={pedidos.length === 0}
      loadingText="Cargando pedidos..."
      emptyText={emptyText}
      minWidthClassName="min-w-[1200px]"
    >
      {pedidos.map((pedido) => (
        <tr key={pedido.id} className="border-t border-line">
          <td className="px-3 py-2">{pedido.usuario?.nombre || "-"}</td>
          <td className="px-3 py-2">{pedido.usuario?.email || "-"}</td>
          <td className="px-3 py-2">{pedido.usuario?.telefono || "-"}</td>
          <td className="px-3 py-2">{getPedidoTotal(pedido)}</td>
          <td className="px-3 py-2">{formatDateTimeEsAr(pedido.fecha_pedido)}</td>
          <td className="px-3 py-2">{formatDateTimeEsAr(pedido.pago?.fecha_pago || "")}</td>
          <td className="px-3 py-2">{pedido.envio?.estado_envio?.nombre || "-"}</td>
          <td className="px-3 py-2">{getPedidoDireccion(pedido)}</td>
          <td className="px-3 py-2">
            <div className="flex flex-wrap gap-2">
              {renderActions?.(pedido)}
              {enableDetailLink && (
                <Link className="app-btn-secondary" href={`${detailBasePath}/${pedido.id}`}>
                  Ver detalle
                </Link>
              )}
            </div>
          </td>
        </tr>
      ))}
    </AdminTable>
  );
}
