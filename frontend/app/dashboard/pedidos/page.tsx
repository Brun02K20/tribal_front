"use client";

import AdminOnly from "@/src/components/admin/AdminOnly";
import AdminShell from "@/src/components/admin/AdminShell";
import PedidosTable from "@/src/components/pedidos/PedidosTable";
import PedidoEstadoModal from "@/src/components/admin/PedidoEstadoModal";
import { usePedidosAdmin } from "@/src/hooks/usePedidosAdmin";

export default function PedidosAdminPage() {
  const {
    pedidos,
    loading,
    submitting,
    error,
    editEstadoMode,
    isEstadoModalOpen,
    currentEstadoId,
    currentOptions,
    openPedidoEstadoModal,
    openEnvioEstadoModal,
    closeEstadoModal,
    saveEstado,
  } = usePedidosAdmin();

  return (
    <AdminOnly>
      <AdminShell
        title="Pedidos"
        subtitle="Visualizador de transacciones con acceso de consulta y detalle."
      >
        <p className="app-subtitle">Total de pedidos: {pedidos.length}</p>
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

        <PedidosTable
          pedidos={pedidos}
          loading={loading}
          emptyText="No hay pedidos registrados."
          enableDetailLink
          detailBasePath="/dashboard/pedidos"
          renderActions={(pedido) => (
            <>
              <button
                className="app-btn-secondary disabled:cursor-not-allowed disabled:opacity-60"
                onClick={() => openPedidoEstadoModal(pedido)}
                disabled={submitting}
              >
                Modificar estado pedido
              </button>
              <button
                className="app-btn-secondary disabled:cursor-not-allowed disabled:opacity-60"
                onClick={() => openEnvioEstadoModal(pedido)}
                disabled={submitting}
              >
                Modificar estado envio
              </button>
            </>
          )}
        />

        <PedidoEstadoModal
          isOpen={isEstadoModalOpen}
          mode={editEstadoMode ?? "pedido"}
          currentEstadoId={currentEstadoId}
          options={currentOptions.map((option) => ({ id: option.id, nombre: option.nombre }))}
          loading={submitting}
          onClose={closeEstadoModal}
          onSave={saveEstado}
        />
      </AdminShell>
    </AdminOnly>
  );
}
