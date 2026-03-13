"use client";

import ProtectedRoute from "@/shared/providers/ProtectedRoute";
import { useAuth } from "@/shared/providers/AuthContext";
import ErrorState from "@/shared/ui/ErrorState";
import LoadingState from "@/shared/ui/LoadingState";
import PedidosTable from "@/features/pedidos/components/PedidosTable";
import { useMisPedidos } from "@/features/pedidos/hooks/useMisPedidos";
import PaginationControls from "@/shared/ui/PaginationControls";

export default function MisPedidosPage() {
  const { user } = useAuth();
  const {
    pedidos,
    loading,
    error,
    page,
    pageSize,
    totalPages,
    totalItems,
    estadosPedido,
    estadosEnvio,
    registerFilters,
    applyFilters,
    clearFilters,
    goToPage,
    changePageSize,
  } = useMisPedidos();

  return (
    <ProtectedRoute>
      <main className="app-page">
        <section className="app-container mx-auto max-w-360">
          <header className="mb-6">
            <h1 className="app-title text-2xl">Mis pedidos</h1>
            <p className="app-subtitle mt-2">
              Historial de compras de {user?.nombre ?? "tu cuenta"}.
            </p>
          </header>

          {loading && <LoadingState message="Cargando tus pedidos..." />}
          {error && <ErrorState message={error} className="mb-4 text-sm text-red-600" />}

          {!loading && !error && (
            <>
              <form
                className="mb-4 grid grid-cols-1 gap-3 rounded-lg border border-line p-3 md:grid-cols-4"
                onSubmit={applyFilters}
              >
                <div>
                  <label className="mb-1 block text-sm text-dark-gray">Fecha pedido desde</label>
                  <input
                    type="date"
                    className="app-input"
                    {...registerFilters("fecha_pedido_min")}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-dark-gray">Fecha pedido hasta</label>
                  <input
                    type="date"
                    className="app-input"
                    {...registerFilters("fecha_pedido_max")}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-dark-gray">Estado pedido</label>
                  <select className="app-input" {...registerFilters("id_estado_pedido")}>
                    <option value="">Todos</option>
                    {estadosPedido.map((estado) => (
                      <option key={estado.id} value={estado.id}>{estado.nombre}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm text-dark-gray">Estado envío</label>
                  <select className="app-input" {...registerFilters("id_estado_envio")}>
                    <option value="">Todos</option>
                    {estadosEnvio.map((estado) => (
                      <option key={estado.id} value={estado.id}>{estado.nombre}</option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-4 flex gap-2">
                  <button type="submit" className="app-btn-primary">Filtrar</button>
                  <button type="button" className="app-btn-secondary" onClick={clearFilters}>Limpiar</button>
                </div>
              </form>

              <PedidosTable
                pedidos={pedidos}
                loading={false}
                emptyText="Aún no registrás pedidos."
                enableDetailLink
                detailBasePath="/mis-pedidos"
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
            </>
          )}
        </section>
      </main>
    </ProtectedRoute>
  );
}

