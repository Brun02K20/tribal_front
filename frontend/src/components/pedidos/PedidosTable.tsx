import Link from "next/link";
import AdminTable from "@/src/components/admin/AdminTable";
import { formatDateTimeEsAr } from "@/src/utils/formatters";
import { getPedidoTotal } from "@/src/utils/pedidos";
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
        "Estado pedido",
        "Estado envío",
        "Acciones",
      ]}
      loading={loading}
      isEmpty={pedidos.length === 0}
      loadingText="Cargando pedidos..."
      emptyText={emptyText}
      minWidthClassName="min-w-[1120px]"
    >
      {pedidos.map((pedido) => (
        <tr key={pedido.id} className="border-t border-line">
          <td className="px-3 py-2">{pedido.usuario?.nombre || "-"}</td>
          <td className="px-3 py-2">{pedido.usuario?.email || "-"}</td>
          <td className="px-3 py-2">{pedido.usuario?.telefono || "-"}</td>
          <td className="px-3 py-2">{getPedidoTotal(pedido)}</td>
          <td className="px-3 py-2">{formatDateTimeEsAr(pedido.fecha_pedido)}</td>
          <td className="px-3 py-2">{formatDateTimeEsAr(pedido.pago?.fecha_pago || "")}</td>
          <td className="px-3 py-2">{pedido.estado_pedido?.nombre || "-"}</td>
          <td className="px-3 py-2">{pedido.envio?.estado_envio?.nombre || "-"}</td>
          <td className="px-3 py-2">
            <div className="flex flex-nowrap items-center gap-2 whitespace-nowrap">
              {renderActions?.(pedido)}
              {enableDetailLink && (
                <Link
                  className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-earth-brown text-earth-brown transition hover:bg-earth-brown/10"
                  href={`${detailBasePath}/${pedido.id}`}
                  aria-label="Ver detalle"
                  title="Ver detalle"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6Z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                </Link>
              )}
            </div>
          </td>
        </tr>
      ))}
    </AdminTable>
  );
}
