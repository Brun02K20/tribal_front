"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/shared/providers/ProtectedRoute";
import LoadingState from "@/shared/ui/LoadingState";
import ErrorState from "@/shared/ui/ErrorState";
import EmptyState from "@/shared/ui/EmptyState";
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

export default function EncargosPageClient() {
  const router = useRouter();
  const {
    user,
    isAdmin,
    loading,
    error,
    success,
    sortedEncargos,
    descripcion,
    creatingEncargo,
    addresses,
    loadingAddresses,
    selectedAddressId,
    isAddressModalOpen,
    creatingAddress,
    provincias,
    ciudades,
    addressForm,
    encargoEnDetalle,
    setDescripcion,
    setSelectedAddressId,
    setAddressForm,
    openAddressModal,
    closeAddressModal,
    handleAddressProvinciaChange,
    handleCreateAddress,
    handleCreateEncargo,
    openDetailModal,
    closeDetailModal,
    canClientPay,
    handleClientPay,
    isPaid,
  } = useEncargosPage();

  useEffect(() => {
    if (user?.id_rol === 1) {
      router.replace("/dashboard/encargos");
    }
  }, [router, user?.id_rol]);

  if (isAdmin) {
    return null;
  }

  const actionButtonClassName =
    "inline-flex h-9 w-9 items-center justify-center rounded-md border border-earth-brown text-earth-brown transition hover:bg-earth-brown/10 disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <ProtectedRoute>
      <main className="app-page">
        <section className="app-container mx-auto max-w-360 space-y-5">
          <header>
            <h1 className="app-title text-2xl">Gestión de encargos</h1>
            <p className="app-subtitle mt-2">
              Creá tu encargo con dirección de entrega y seguí su estado hasta recibir el link de pago.
            </p>
          </header>

          {loading && <LoadingState message="Cargando encargos..." />}
          {error && <ErrorState className="text-sm text-red-600" message={error} />}
          {success && <p className="text-sm text-green-700">{success}</p>}

          {!loading && (
            <>
              <section className="app-panel">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Dirección de entrega</h2>
                  <button type="button" className="app-btn-secondary text-sm" onClick={openAddressModal}>
                    Nueva dirección
                  </button>
                </div>

                {loadingAddresses ? (
                  <LoadingState message="Cargando direcciones..." />
                ) : addresses.length === 0 ? (
                  <EmptyState message="No tenés direcciones cargadas. Creá una para continuar." />
                ) : (
                  <div className="space-y-2">
                    {addresses.map((address) => (
                      <label
                        key={address.id}
                        className="flex cursor-pointer items-start gap-3 rounded-md border border-line p-3"
                      >
                        <input
                          type="radio"
                          name="selected-address"
                          checked={selectedAddressId === address.id}
                          onChange={() => setSelectedAddressId(address.id)}
                          className="mt-1"
                        />
                        <span className="text-sm">
                          {address.calle} {address.altura}, {address.ciudad}, {address.provincia} ({address.cod_postal_destino})
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </section>

              <form className="app-panel grid gap-3" onSubmit={handleCreateEncargo}>
                <h2 className="app-title text-xl">Nuevo encargo</h2>
                <label className="grid gap-1 text-sm text-dark-gray">
                  Descripción del encargo
                  <textarea
                    className="app-input"
                    rows={4}
                    value={descripcion}
                    onChange={(event) => setDescripcion(event.target.value)}
                    required
                  />
                </label>
                <div>
                  <button
                    type="submit"
                    className="app-btn-primary disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={creatingEncargo || !selectedAddressId}
                  >
                    {creatingEncargo ? "Creando..." : "Crear encargo"}
                  </button>
                </div>
              </form>

              <section className="app-panel overflow-x-auto">
                <h2 className="app-title mb-3 text-xl">Listado de encargos</h2>
                <table className="min-w-195 text-left text-sm">
                  <thead>
                    <tr className="border-b border-line">
                      <th className="px-2 py-2">ID</th>
                      <th className="px-2 py-2">Fecha</th>
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
                          <div className="flex flex-nowrap items-center gap-2">
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
                            {!isPaid(encargo) && (
                              <button
                                type="button"
                                className={actionButtonClassName}
                                onClick={() => handleClientPay(encargo)}
                                disabled={!canClientPay(encargo)}
                                aria-label="Pagar encargo"
                                title="Pagar encargo"
                              >
                                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
                                  <rect x="2" y="6" width="20" height="12" rx="2" />
                                  <path d="M2 10h20" />
                                  <path d="M8 14h4" />
                                </svg>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {!sortedEncargos.length && (
                      <tr>
                        <td className="px-2 py-3 text-dark-gray" colSpan={7}>
                          No hay encargos para mostrar.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </section>
            </>
          )}
        </section>

        {isAddressModalOpen && (
          <AppModal>
            <div className="app-modal-backdrop">
              <div className="app-modal-card max-w-lg p-4 sm:p-5">
                <h3 className="app-title text-xl">Nueva dirección</h3>

                <form className="mt-4 grid gap-3" onSubmit={handleCreateAddress}>
                  <div>
                    <label className="mb-1 block text-sm text-dark-gray">Código postal</label>
                    <input
                      className="app-input"
                      placeholder="Ej: X5000"
                      value={addressForm.cod_postal_destino}
                      onChange={(event) =>
                        setAddressForm((prev) => ({
                          ...prev,
                          cod_postal_destino: event.target.value,
                        }))
                      }
                      maxLength={16}
                      required
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm text-dark-gray">Calle</label>
                    <input
                      className="app-input"
                      placeholder="Ej: Av. Colón"
                      value={addressForm.calle}
                      onChange={(event) =>
                        setAddressForm((prev) => ({
                          ...prev,
                          calle: event.target.value,
                        }))
                      }
                      maxLength={128}
                      required
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm text-dark-gray">Altura</label>
                    <input
                      className="app-input"
                      placeholder="Ej: 1234"
                      inputMode="numeric"
                      value={addressForm.altura}
                      onChange={(event) =>
                        setAddressForm((prev) => ({
                          ...prev,
                          altura: event.target.value,
                        }))
                      }
                      maxLength={10}
                      required
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm text-dark-gray">Provincia</label>
                    <select
                      className="app-input"
                      value={addressForm.id_provincia}
                      onChange={(event) => void handleAddressProvinciaChange(Number(event.target.value))}
                      required
                    >
                      <option value={0}>Seleccionar provincia...</option>
                      {provincias.map((provincia) => (
                        <option key={provincia.id} value={provincia.id}>
                          {provincia.nombre}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm text-dark-gray">Ciudad</label>
                    <select
                      className="app-input"
                      value={addressForm.id_ciudad}
                      onChange={(event) =>
                        setAddressForm((prev) => ({
                          ...prev,
                          id_ciudad: Number(event.target.value),
                        }))
                      }
                      required
                    >
                      <option value={0}>Seleccionar ciudad...</option>
                      {ciudades.map((ciudad) => (
                        <option key={ciudad.id} value={ciudad.id}>
                          {ciudad.nombre}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mt-5 flex justify-end gap-2">
                    <button type="button" className="app-btn-secondary" onClick={closeAddressModal} disabled={creatingAddress}>
                      Cancelar
                    </button>
                    <button type="submit" className="app-btn-primary" disabled={creatingAddress}>
                      {creatingAddress ? "Guardando..." : "Guardar dirección"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </AppModal>
        )}

        {encargoEnDetalle && (
          <AppModal>
            <div className="app-modal-backdrop">
              <div className="app-modal-card max-w-2xl p-4 sm:p-5">
                <h3 className="app-title text-xl">Detalle del encargo #{encargoEnDetalle.id}</h3>

                <div className="mt-4 grid gap-3 text-sm text-black sm:grid-cols-2">
                  <div>
                    <p className="text-dark-gray">Fecha</p>
                    <p>{toDateTime(encargoEnDetalle.fecha_encargo)}</p>
                  </div>
                  <div>
                    <p className="text-dark-gray">Estado</p>
                    <p>{encargoEnDetalle.estado_encargo?.nombre ?? `Estado #${encargoEnDetalle.id_estado}`}</p>
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
      </main>
    </ProtectedRoute>
  );
}
