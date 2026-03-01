"use client";

import AdminOnly from "@/src/components/admin/AdminOnly";
import AdminShell from "@/src/components/admin/AdminShell";
import PedidosTable from "@/src/components/pedidos/PedidosTable";
import PedidoEstadoModal from "@/src/components/admin/PedidoEstadoModal";
import { usePedidosAdmin } from "@/src/hooks/usePedidosAdmin";
import PaginationControls from "@/src/components/ui/PaginationControls";

export default function PedidosAdminPage() {
  const {
    pedidos,
    estadosPedido,
    estadosEnvio,
    loading,
    submitting,
    error,
    page,
    pageSize,
    totalPages,
    totalItems,
    filtersForm,
    editEstadoMode,
    isEstadoModalOpen,
    currentEstadoId,
    currentOptions,
    updateFilterField,
    applyFilters,
    clearFilters,
    goToPage,
    changePageSize,
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
        <p className="app-subtitle">Total de pedidos: {totalItems}</p>
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

        <div className="mt-4 grid grid-cols-1 gap-3 rounded-lg border border-line p-3 md:grid-cols-3">
          <div>
            <label className="mb-1 block text-sm text-dark-gray">Nombre de usuario</label>
            <input
              className="app-input"
              placeholder="Ej: Juan Pérez"
              value={filtersForm.nombre_usuario}
              onChange={(event) => updateFilterField("nombre_usuario", event.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-dark-gray">Mail de usuario</label>
            <input
              className="app-input"
              placeholder="Ej: juan@mail.com"
              value={filtersForm.email_usuario}
              onChange={(event) => updateFilterField("email_usuario", event.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-dark-gray">Fecha pedido mínima</label>
            <input
              type="date"
              className="app-input"
              value={filtersForm.fecha_pedido_min}
              onChange={(event) => updateFilterField("fecha_pedido_min", event.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-dark-gray">Fecha pedido máxima</label>
            <input
              type="date"
              className="app-input"
              value={filtersForm.fecha_pedido_max}
              onChange={(event) => updateFilterField("fecha_pedido_max", event.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-dark-gray">Estado de pedido</label>
            <select
              className="app-input"
              value={filtersForm.id_estado_pedido}
              onChange={(event) => updateFilterField("id_estado_pedido", event.target.value)}
            >
              <option value="">Todos los estados</option>
              {estadosPedido.map((estado) => (
                <option key={estado.id} value={estado.id}>{estado.nombre}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm text-dark-gray">Estado de envío</label>
            <select
              className="app-input"
              value={filtersForm.id_estado_envio}
              onChange={(event) => updateFilterField("id_estado_envio", event.target.value)}
            >
              <option value="">Todos los estados</option>
              {estadosEnvio.map((estado) => (
                <option key={estado.id} value={estado.id}>{estado.nombre}</option>
              ))}
            </select>
          </div>

          <div className="md:col-span-3 flex gap-2">
            <button type="button" className="app-btn-primary" onClick={applyFilters}>Filtrar</button>
            <button type="button" className="app-btn-secondary" onClick={clearFilters}>Limpiar</button>
          </div>
        </div>

        <PedidosTable
          pedidos={pedidos}
          loading={loading}
          emptyText="No hay pedidos registrados."
          enableDetailLink
          detailBasePath="/dashboard/pedidos"
          renderActions={(pedido) => (
            <>
              <button
                className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-md border border-earth-brown text-earth-brown transition hover:bg-earth-brown/10 disabled:cursor-not-allowed disabled:opacity-60"
                onClick={() => openPedidoEstadoModal(pedido)}
                disabled={submitting}
                type="button"
                aria-label="Modificar estado de pedido"
                title="Modificar estado de pedido"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="m4 20 4.5-1 9-9a2.1 2.1 0 0 0-3-3l-9 9L4 20Z" />
                  <path d="m13 7 3 3" />
                </svg>
              </button>
              <button
                className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-md border border-earth-brown text-earth-brown transition hover:bg-earth-brown/10 disabled:cursor-not-allowed disabled:opacity-60"
                onClick={() => openEnvioEstadoModal(pedido)}
                disabled={submitting}
                type="button"
                aria-label="Modificar estado de envío"
                title="Modificar estado de envío"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M3 7h13" />
                  <path d="M3 12h10" />
                  <path d="M3 17h8" />
                  <path d="M17 8l4 4-4 4" />
                  <path d="M21 12h-7" />
                </svg>
              </button>
            </>
          )}
        />

        <PaginationControls
          page={page}
          totalPages={totalPages}
          totalItems={totalItems}
          pageSize={pageSize}
          onPageChange={goToPage}
          pageSizeOptions={[10, 15, 20]}
          onPageSizeChange={changePageSize}
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
