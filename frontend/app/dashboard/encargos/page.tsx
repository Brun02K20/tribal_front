"use client";

import AdminOnly from "@/features/admin/components/AdminOnly";
import AdminShell from "@/features/admin/components/AdminShell";
import LoadingState from "@/shared/ui/LoadingState";
import ErrorState from "@/shared/ui/ErrorState";
import AppModal from "@/shared/ui/AppModal";
import { useEncargosPage } from "@/features/encargos/hooks/useEncargosPage";

const toCurrency = (value: number | null) => {
  if (value === null || value === undefined) {
    return "Sin definir";
  }

  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 2,
  }).format(Number(value));
};

const toDateTime = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleString("es-AR");
};

export default function DashboardEncargosPage() {
  const {
    isAdmin,
    loading,
    error,
    success,
    sortedEncargos,
    encargoEnEdicion,
    encargoEnDetalle,
    savingEdit,
    editForm,
    generatingLinkId,
    setEditForm,
    openEditModal,
    closeEditModal,
    handleSaveEdit,
    handleGeneratePaymentLink,
    isCompleteForPayment,
    openDetailModal,
    closeDetailModal,
  } = useEncargosPage();

  const actionButtonClassName =
    "inline-flex h-9 w-9 items-center justify-center rounded-md border border-earth-brown text-earth-brown transition hover:bg-earth-brown/10 disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <AdminOnly>
      <AdminShell
        title="Encargos"
        subtitle="Editá presupuesto, dimensiones y peso. Enviá link de pago cuando el encargo esté completo."
      >
        <section className="app-panel overflow-x-auto">
          {loading && <LoadingState message="Cargando encargos..." />}
          {error && <ErrorState className="mb-3 text-sm text-red-600" message={error} />}
          {success && <p className="mb-3 text-sm text-green-700">{success}</p>}

          {!loading && (
            <table className="min-w-245 text-left text-sm">
              <thead>
                <tr className="border-b border-line">
                  <th className="px-2 py-2">ID</th>
                  <th className="px-2 py-2">Fecha</th>
                  <th className="px-2 py-2">Cliente</th>
                  <th className="px-2 py-2">Estado</th>
                  <th className="px-2 py-2">Presupuesto</th>
                  <th className="px-2 py-2">Medidas</th>
                  <th className="px-2 py-2">Peso (g)</th>
                  <th className="px-2 py-2">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {sortedEncargos.map((encargo) => (
                  <tr key={encargo.id} className="border-b border-line/70 align-top">
                    <td className="px-2 py-2 font-semibold">#{encargo.id}</td>
                    <td className="px-2 py-2">{toDateTime(encargo.fecha_encargo)}</td>
                    <td className="px-2 py-2">
                      <p>{encargo.usuario?.nombre ?? `Usuario #${encargo.id_usuario}`}</p>
                      <p className="text-xs text-dark-gray">{encargo.usuario?.email ?? ""}</p>
                    </td>
                    <td className="px-2 py-2">{encargo.estado_encargo?.nombre ?? `Estado #${encargo.id_estado}`}</td>
                    <td className="px-2 py-2">{toCurrency(Number(encargo.presupuesto ?? null))}</td>
                    <td className="px-2 py-2">
                      {Number(encargo.ancho ?? 0) > 0 && Number(encargo.alto ?? 0) > 0 && Number(encargo.profundo ?? 0) > 0
                        ? `${Number(encargo.ancho)} x ${Number(encargo.alto)} x ${Number(encargo.profundo)} cm`
                        : "Sin definir"}
                    </td>
                    <td className="px-2 py-2">
                      {Number(encargo.peso_en_gramos ?? 0) > 0 ? Number(encargo.peso_en_gramos) : "Sin definir"}
                    </td>
                    <td className="px-2 py-2">
                      <div className="flex flex-nowrap items-center gap-2 whitespace-nowrap">
                        <button
                          type="button"
                          className={actionButtonClassName}
                          onClick={() => openDetailModal(encargo)}
                          aria-label="Ver detalle"
                          title="Ver detalle"
                        >
                          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
                            <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6Z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          className={actionButtonClassName}
                          onClick={() => openEditModal(encargo)}
                          aria-label="Editar presupuesto"
                          title="Editar presupuesto"
                        >
                          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
                            <path d="m4 20 4.5-1 9-9a2.1 2.1 0 0 0-3-3l-9 9L4 20Z" />
                            <path d="m13 7 3 3" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          className={actionButtonClassName}
                          disabled={!isCompleteForPayment(encargo) || generatingLinkId === encargo.id}
                          onClick={() => void handleGeneratePaymentLink(encargo)}
                          aria-label="Generar link de pago"
                          title="Generar link de pago"
                        >
                          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
                            <path d="M10 13a5 5 0 0 1 0-7l1.5-1.5a5 5 0 0 1 7 7L17 13" />
                            <path d="M14 11a5 5 0 0 1 0 7L12.5 19.5a5 5 0 0 1-7-7L7 11" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {!sortedEncargos.length && (
                  <tr>
                    <td className="px-2 py-3 text-dark-gray" colSpan={8}>
                      No hay encargos para mostrar.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </section>

        {encargoEnDetalle && (
          <AppModal>
            <div className="app-modal-backdrop">
              <div className="app-modal-card max-w-2xl p-4 sm:p-5">
                <h3 className="app-title text-xl">Detalle del encargo #{encargoEnDetalle.id}</h3>

                <div className="mt-4 grid gap-3 text-sm text-black sm:grid-cols-2">
                  <div>
                    <p className="text-dark-gray">Cliente</p>
                    <p>{encargoEnDetalle.usuario?.nombre ?? `Usuario #${encargoEnDetalle.id_usuario}`}</p>
                    <p className="text-xs text-dark-gray">{encargoEnDetalle.usuario?.email ?? ""}</p>
                  </div>
                  <div>
                    <p className="text-dark-gray">Estado</p>
                    <p>{encargoEnDetalle.estado_encargo?.nombre ?? `Estado #${encargoEnDetalle.id_estado}`}</p>
                  </div>
                  <div>
                    <p className="text-dark-gray">Fecha</p>
                    <p>{toDateTime(encargoEnDetalle.fecha_encargo)}</p>
                  </div>
                  <div>
                    <p className="text-dark-gray">Presupuesto</p>
                    <p>{toCurrency(Number(encargoEnDetalle.presupuesto ?? null))}</p>
                  </div>
                  <div>
                    <p className="text-dark-gray">Medidas</p>
                    <p>
                      {Number(encargoEnDetalle.ancho ?? 0) > 0 && Number(encargoEnDetalle.alto ?? 0) > 0 && Number(encargoEnDetalle.profundo ?? 0) > 0
                        ? `${Number(encargoEnDetalle.ancho)} x ${Number(encargoEnDetalle.alto)} x ${Number(encargoEnDetalle.profundo)} cm`
                        : "Sin definir"}
                    </p>
                  </div>
                  <div>
                    <p className="text-dark-gray">Peso (g)</p>
                    <p>{Number(encargoEnDetalle.peso_en_gramos ?? 0) > 0 ? Number(encargoEnDetalle.peso_en_gramos) : "Sin definir"}</p>
                  </div>
                  <div>
                    <p className="text-dark-gray">Dirección</p>
                    <p>
                      {encargoEnDetalle.direccion
                        ? `${encargoEnDetalle.direccion.calle} ${encargoEnDetalle.direccion.altura} (${encargoEnDetalle.direccion.cod_postal_destino})`
                        : `Dirección #${encargoEnDetalle.id_direccion}`}
                    </p>
                  </div>
                  <div className="sm:col-span-2">
                    <p className="text-dark-gray">Descripción</p>
                    <p className="whitespace-pre-wrap">{encargoEnDetalle.descripcion}</p>
                  </div>
                </div>

                <div className="mt-5 flex justify-end gap-2">
                  <button type="button" className="app-btn-secondary" onClick={closeDetailModal}>
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          </AppModal>
        )}

        {encargoEnEdicion && isAdmin && (
          <AppModal>
            <div className="app-modal-backdrop">
              <div className="app-modal-card max-w-lg p-4 sm:p-5">
                <h3 className="app-title text-xl">Editar encargo #{encargoEnEdicion.id}</h3>

                <form className="mt-4 grid gap-3" onSubmit={handleSaveEdit}>
                  <div>
                    <label className="mb-1 block text-sm text-dark-gray">Presupuesto (ARS)</label>
                    <input
                      className="app-input"
                      type="number"
                      min="0"
                      step="0.01"
                      value={editForm.presupuesto}
                      onChange={(event) =>
                        setEditForm((prev) => ({
                          ...prev,
                          presupuesto: event.target.value,
                        }))
                      }
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <div>
                      <label className="mb-1 block text-sm text-dark-gray">Ancho (cm)</label>
                      <input
                        className="app-input"
                        type="number"
                        min="0"
                        step="0.01"
                        value={editForm.ancho}
                        onChange={(event) =>
                          setEditForm((prev) => ({
                            ...prev,
                            ancho: event.target.value,
                          }))
                        }
                        required
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm text-dark-gray">Alto (cm)</label>
                      <input
                        className="app-input"
                        type="number"
                        min="0"
                        step="0.01"
                        value={editForm.alto}
                        onChange={(event) =>
                          setEditForm((prev) => ({
                            ...prev,
                            alto: event.target.value,
                          }))
                        }
                        required
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm text-dark-gray">Profundo (cm)</label>
                      <input
                        className="app-input"
                        type="number"
                        min="0"
                        step="0.01"
                        value={editForm.profundo}
                        onChange={(event) =>
                          setEditForm((prev) => ({
                            ...prev,
                            profundo: event.target.value,
                          }))
                        }
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm text-dark-gray">Peso (gramos)</label>
                    <input
                      className="app-input"
                      type="number"
                      min="0"
                      step="0.01"
                      value={editForm.peso_en_gramos}
                      onChange={(event) =>
                        setEditForm((prev) => ({
                          ...prev,
                          peso_en_gramos: event.target.value,
                        }))
                      }
                      required
                    />
                  </div>

                  <div className="mt-5 flex justify-end gap-2">
                    <button type="button" className="app-btn-secondary" onClick={closeEditModal} disabled={savingEdit}>
                      Cancelar
                    </button>
                    <button type="submit" className="app-btn-primary" disabled={savingEdit}>
                      {savingEdit ? "Guardando..." : "Guardar cambios"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </AppModal>
        )}
      </AdminShell>
    </AdminOnly>
  );
}
