"use client";

import Link from "next/link";
import { useCheckout } from "@/features/checkout/hooks/useCheckout";
import { formatCurrencyArs } from "@/shared/lib/formatters";
import LoadingState from "@/shared/ui/LoadingState";
import EmptyState from "@/shared/ui/EmptyState";
import ImagePlaceholder from "@/shared/ui/ImagePlaceholder";
import ErrorState from "@/shared/ui/ErrorState";
import AppModal from "@/shared/ui/AppModal";

export default function CheckoutPage() {
  const {
    isAuthenticated,
    loading,
    items,
    subtotal,
    totalItems,
    total,
    shippingCost,
    commissionCost,
    error,
    addresses,
    loadingAddresses,
    selectedAddressId,
    setSelectedAddressId,
    provincias,
    ciudades,
    isAddressModalOpen,
    creatingAddress,
    newAddress,
    paying,
    openAddressModal,
    closeAddressModal,
    changeNewAddressField,
    createAddress,
    pay,
    updateItemQuantity,
    removeCheckoutItem,
  } = useCheckout();

  if (loading || !isAuthenticated) {
    return (
      <main className="app-page">
        <LoadingState message="Cargando checkout..." />
      </main>
    );
  }

  return (
    <main className="app-page">
      <div className="app-container mx-auto max-w-360">
        <header className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="app-title text-2xl">Checkout</h1>
            <p className="app-subtitle text-sm">Revisá tu compra antes de pagar.</p>
          </div>
          <Link href="/products" className="app-btn-secondary text-sm">
            Seguir comprando
          </Link>
        </header>

        {error && <ErrorState message={error} className="mb-4 text-sm text-red-600" />}

        <section className="app-panel mb-6">
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

        {items.length === 0 ? (
          <section className="app-panel">
            <EmptyState
              message="Tu carrito está vacío."
              className="mb-4"
              action={
                <Link href="/products" className="app-btn-primary">
                  Ir a productos
                </Link>
              }
            />
          </section>
        ) : (
          <section className="grid grid-cols-1 gap-6 md:grid-cols-[1.5fr_1fr]">
            <div className="app-panel">
              <h2 className="mb-4 text-lg font-semibold">Productos ({totalItems})</h2>

              <div className="space-y-4">
                {items.map((item) => (
                  <article key={item.id} className="flex gap-3 rounded-md border p-3">
                    {item.fotoUrl ? (
                      <img src={item.fotoUrl} alt={item.nombre} className="h-20 w-20 rounded-md object-cover" />
                    ) : (
                      <ImagePlaceholder
                        className="flex h-20 w-20 items-center justify-center rounded-md bg-zinc-100"
                        textClassName="text-xs text-zinc-500"
                      />
                    )}

                    <div className="flex-1">
                      <h3 className="font-medium">{item.nombre}</h3>
                      <p className="text-sm text-zinc-600">{formatCurrencyArs(item.precio)} c/u</p>
                      <p className="text-sm font-semibold">Subtotal: {formatCurrencyArs(item.precio * item.quantity)}</p>

                      <div className="mt-2 flex items-center gap-2">
                        <div>
                          <label className="mb-1 block text-xs text-dark-gray">Cantidad</label>
                          <input
                            type="number"
                            min={1}
                            max={Math.max(1, item.stock)}
                            value={item.quantity}
                            onChange={(event) => updateItemQuantity(item.id, Number(event.target.value))}
                            className="app-input w-20"
                            placeholder="Ej: 1"
                          />
                        </div>
                        <button
                          onClick={() => removeCheckoutItem(item.id)}
                          className="app-btn-secondary px-2 py-1 text-sm"
                        >
                          Quitar
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            <aside className="app-panel h-fit">
              <h2 className="mb-4 text-lg font-semibold">Resumen</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Productos</span>
                  <span>{formatCurrencyArs(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Envío</span>
                  <span>{formatCurrencyArs(shippingCost)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Comisiones</span>
                  <span>{formatCurrencyArs(commissionCost)}</span>
                </div>
                <hr className="my-2" />
                <div className="flex justify-between text-base font-bold">
                  <span>Total</span>
                  <span>{formatCurrencyArs(total)}</span>
                </div>
              </div>

              <button
                className="app-btn-primary mt-4 w-full disabled:cursor-not-allowed disabled:opacity-60"
                onClick={pay}
                disabled={paying || !selectedAddressId || items.length === 0}
              >
                {paying ? "Procesando..." : "PAGAR"}
              </button>
            </aside>
          </section>
        )}

        {isAddressModalOpen && (
          <AppModal>
            <div className="app-modal-backdrop">
              <div className="app-modal-card max-w-lg p-4 sm:p-5">
                <h3 className="app-title text-xl">Nueva dirección</h3>

                <div className="mt-4 grid gap-3">
                  <div>
                    <label className="mb-1 block text-sm text-dark-gray">Código postal</label>
                    <input
                      className="app-input"
                      placeholder="Ej: X5000"
                      value={newAddress.cod_postal_destino}
                      onChange={(event) => changeNewAddressField("cod_postal_destino", event.target.value)}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm text-dark-gray">Calle</label>
                    <input
                      className="app-input"
                      placeholder="Ej: Av. Colón"
                      value={newAddress.calle}
                      onChange={(event) => changeNewAddressField("calle", event.target.value)}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm text-dark-gray">Altura</label>
                    <input
                      className="app-input"
                      placeholder="Ej: 1234"
                      inputMode="numeric"
                      value={newAddress.altura}
                      onChange={(event) =>
                        changeNewAddressField("altura", event.target.value.replace(/\D/g, ""))
                      }
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm text-dark-gray">Provincia</label>
                    <select
                      className="app-input"
                      value={newAddress.id_provincia}
                      onChange={(event) => changeNewAddressField("id_provincia", Number(event.target.value))}
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
                      value={newAddress.id_ciudad}
                      onChange={(event) => changeNewAddressField("id_ciudad", Number(event.target.value))}
                    >
                      <option value={0}>Seleccionar ciudad...</option>
                      {ciudades.map((ciudad) => (
                        <option key={ciudad.id} value={ciudad.id}>
                          {ciudad.nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mt-5 flex justify-end gap-2">
                  <button type="button" className="app-btn-secondary" onClick={closeAddressModal} disabled={creatingAddress}>
                    Cancelar
                  </button>
                  <button type="button" className="app-btn-primary" onClick={createAddress} disabled={creatingAddress}>
                    {creatingAddress ? "Guardando..." : "Guardar dirección"}
                  </button>
                </div>
              </div>
            </div>
          </AppModal>
        )}
      </div>
    </main>
  );
}

