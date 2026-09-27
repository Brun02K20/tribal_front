"use client";

import Link from "next/link";
import { useCheckout } from "@/features/checkout/hooks/useCheckout";
import { formatCurrencyArs, formatPrice } from "@/shared/lib/formatters";
import LoadingState from "@/shared/ui/LoadingState";
import ImagePlaceholder from "@/shared/ui/ImagePlaceholder";
import {
  IconArrowLeft,
  IconArrowRight,
  IconBag,
  IconCheck,
  IconLock,
  IconMinus,
  IconPlus,
  IconTrash,
  IconTruck,
} from "@/shared/ui/Icons";
import ErrorState from "@/shared/ui/ErrorState";
import AppModal from "@/shared/ui/AppModal";

const checkoutSteps = ["Carrito", "Envío", "Pago"];

export default function CheckoutPage() {
  const {
    isAuthenticated,
    loading,
    items,
    subtotal,
    totalItems,
    total,
    totalSavings,
    shippingCost,
    error,
    addresses,
    loadingAddresses,
    selectedAddressId,
    setSelectedAddressId,
    provincias,
    ciudades,
    isAddressModalOpen,
    creatingAddress,
    registerAddress,
    handleAddressSubmit,
    addressErrors,
    submitNewAddress,
    registerObservaciones,
    observacionesValue,
    paying,
    openAddressModal,
    closeAddressModal,
    pay,
    updateItemQuantity,
    removeCheckoutItem,
    shippingRates,
    loadingRates,
    selectedRate,
    setSelectedRate,
  } = useCheckout();

  const canPay = !paying && Boolean(selectedAddressId) && Boolean(selectedRate) && items.length > 0;
  const payHint = !selectedAddressId
    ? "Elegí o cargá una dirección de entrega para continuar."
    : !selectedRate
      ? "Elegí cómo querés recibir tu pedido para continuar."
      : null;

  if (loading || !isAuthenticated) {
    return (
      <main className="mx-auto w-full max-w-360 px-4 py-10 md:px-6">
        <LoadingState message="Preparando tu compra..." className="text-dark-gray" />
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-360 px-4 pt-6 md:px-6 md:pt-10">
        <ol className="mb-6 flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-dark-gray sm:text-sm" aria-label="Pasos de compra">
          {checkoutSteps.map((step, index) => {
            const done = index === 0;
            const current = index === 1;
            return (
              <li key={step} className="flex items-center gap-2">
                <span
                  className={`grid h-7 w-7 place-items-center rounded-full border text-xs font-bold ${
                    done
                      ? "border-sage bg-sage text-cream"
                      : current
                        ? "border-terracotta bg-terracotta text-cream"
                        : "border-line bg-white/70 text-dark-gray"
                  }`}
                  aria-current={current ? "step" : undefined}
                >
                  {done ? <IconCheck className="h-4 w-4" /> : index + 1}
                </span>
                <span className={current ? "font-semibold text-black" : ""}>{step}</span>
                {index < checkoutSteps.length - 1 && <span className="mx-1 h-px w-6 bg-line sm:w-10" aria-hidden="true" />}
              </li>
            );
          })}
        </ol>

        <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="app-display text-3xl md:text-4xl">Finalizá tu compra</h1>
            <p className="mt-1 text-sm text-dark-gray">Estás a un paso de tener tus piezas.</p>
          </div>
          <Link href="/products" className="inline-flex items-center gap-1.5 text-sm text-earth-brown underline-offset-4 hover:underline">
            <IconArrowLeft className="h-4 w-4" /> Seguir comprando
          </Link>
        </header>

        {error && <ErrorState message={error} className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700" />}

        {items.length === 0 ? (
          <section className="flex flex-col items-center gap-4 rounded-3xl border border-dashed border-earth-brown/40 bg-white/70 px-6 py-14 text-center">
            <span className="grid h-20 w-20 place-items-center rounded-full bg-sand text-earth-brown">
              <IconBag className="h-9 w-9" />
            </span>
            <p className="app-display text-2xl">Tu carrito está vacío</p>
            <p className="max-w-sm text-sm text-dark-gray">Cada pieza es única: elegí la tuya antes de que encuentre otro hogar.</p>
            <Link href="/products" className="app-btn-cta">
              Descubrir la colección <IconArrowRight className="h-4 w-4" />
            </Link>
          </section>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_400px] lg:gap-10">
            <div className="space-y-6">
              <section className="rounded-3xl border border-line bg-white/80 p-5 md:p-6">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <h2 className="app-display text-2xl">¿Dónde lo recibís?</h2>
                  <button type="button" className="inline-flex items-center gap-1.5 text-sm font-semibold text-earth-brown hover:underline" onClick={openAddressModal}>
                    <IconPlus className="h-4 w-4" /> Nueva dirección
                  </button>
                </div>

                {loadingAddresses ? (
                  <LoadingState message="Cargando direcciones..." className="text-sm text-dark-gray" />
                ) : addresses.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-earth-brown/40 p-5 text-center">
                    <p className="text-sm text-dark-gray">Todavía no tenés direcciones guardadas.</p>
                    <button type="button" className="app-btn-cta mt-3" onClick={openAddressModal}>
                      Cargar mi dirección
                    </button>
                  </div>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {addresses.map((address) => {
                      const selected = selectedAddressId === address.id;
                      return (
                        <label
                          key={address.id}
                          className={`flex cursor-pointer items-start gap-3 rounded-2xl border-2 p-4 transition ${
                            selected ? "border-terracotta bg-terracotta/5" : "border-line bg-white hover:border-earth-brown/50"
                          }`}
                        >
                          <input
                            type="radio"
                            name="selected-address"
                            checked={selected}
                            onChange={() => setSelectedAddressId(address.id)}
                            className="mt-1 accent-terracotta"
                          />
                          <span className="text-sm">
                            <span className="block font-semibold text-black">
                              {address.calle} {address.altura}
                            </span>
                            {address.ciudad}, {address.provincia} ({address.cod_postal_destino})
                            {(address.piso || address.departamento) && (
                              <span className="block text-xs text-dark-gray">
                                Piso {address.piso ?? "-"} {address.departamento ? `Depto ${address.departamento}` : ""}
                              </span>
                            )}
                            {address.observaciones && (
                              <span className="block text-xs text-dark-gray">{address.observaciones}</span>
                            )}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </section>

              <section className="rounded-3xl border border-line bg-white/80 p-5 md:p-6">
                <h2 className="app-display mb-4 text-2xl">¿Cómo te lo enviamos?</h2>

                {loadingRates ? (
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="app-skeleton h-20 rounded-2xl" />
                    <div className="app-skeleton h-20 rounded-2xl" />
                  </div>
                ) : shippingRates.length === 0 ? (
                  <p className="rounded-2xl border border-dashed border-line p-4 text-center text-sm text-dark-gray">
                    {selectedAddressId
                      ? "No encontramos opciones de envío para esta dirección. Escribinos por el chat y lo resolvemos."
                      : "Elegí una dirección para ver las opciones de envío."}
                  </p>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {shippingRates.map((rate) => {
                      const isSelected =
                        selectedRate?.deliveredType === rate.deliveredType &&
                        selectedRate?.productType === rate.productType;

                      return (
                        <button
                          key={`${rate.deliveredType}-${rate.productType}`}
                          type="button"
                          onClick={() => setSelectedRate(rate)}
                          aria-pressed={isSelected}
                          className={`flex items-start justify-between gap-3 rounded-2xl border-2 p-4 text-left transition ${
                            isSelected ? "border-terracotta bg-terracotta/5" : "border-line bg-white hover:border-earth-brown/50"
                          }`}
                        >
                          <span className="flex items-start gap-3">
                            <IconTruck className={`mt-0.5 h-5 w-5 shrink-0 ${isSelected ? "text-terracotta" : "text-earth-brown"}`} />
                            <span>
                              <span className="block text-sm font-semibold text-black">
                                {rate.deliveredType === "D" ? "A domicilio" : "Retiro en sucursal"}
                              </span>
                              <span className="block text-xs text-dark-gray">
                                {rate.productName} · {rate.deliveryTimeMin}-{rate.deliveryTimeMax} días hábiles
                              </span>
                            </span>
                          </span>
                          <span className="whitespace-nowrap font-bold text-black">{formatPrice(rate.price)}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </section>

              <details className="app-details rounded-3xl border border-line bg-white/80 p-5 md:p-6">
                <summary className="flex items-center gap-2 font-semibold">
                  Agregar una nota al pedido <span className="text-xs font-normal text-dark-gray">(opcional)</span>
                  <IconPlus className="app-details-icon ml-auto h-4 w-4 text-earth-brown" />
                </summary>
                <textarea
                  className="app-input mt-4 min-h-28 w-full resize-y"
                  placeholder="Ej: Es para regalo. Entregar por la tarde."
                  {...registerObservaciones('observaciones', { maxLength: 1000 })}
                />
                <p className="mt-1 text-right text-xs text-dark-gray">{observacionesValue.length}/1000</p>
              </details>
            </div>

            <aside className="h-fit rounded-3xl border border-line bg-white/90 p-5 shadow-[0_18px_40px_rgba(47,47,47,0.1)] md:p-6 lg:sticky lg:top-28">
              <h2 className="app-display text-2xl">Tu pedido</h2>
              <p className="text-xs text-dark-gray">{totalItems} {totalItems === 1 ? "pieza" : "piezas"}</p>

              <ul className="mt-4 max-h-80 space-y-4 overflow-y-auto pr-1 pt-2">
                {items.map((item) => {
                  const precioOriginal = Number(item.precio_original ?? item.precio);
                  const precioCompra = Number(item.precio);
                  const tieneDescuento = precioOriginal > precioCompra;
                  const lockedByDesigns = Boolean(item.disenos_urls?.length);

                  return (
                    <li key={item.id} className="flex gap-3">
                      <div className="relative shrink-0">
                        {item.fotoUrl ? (
                          <img src={item.fotoUrl} alt={item.nombre} className="h-16 w-14 rounded-xl object-cover" />
                        ) : (
                          <ImagePlaceholder
                            className="flex h-16 w-14 items-center justify-center rounded-xl bg-sand"
                            textClassName="text-[10px] text-dark-gray"
                          />
                        )}
                        <span className="absolute -right-1.5 -top-1.5 grid h-5 min-w-5 place-items-center rounded-full bg-black px-1 text-[10px] font-bold text-cream">
                          {item.quantity}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <p className="truncate text-sm font-semibold first-letter:uppercase">{item.nombre}</p>
                          <button
                            type="button"
                            onClick={() => removeCheckoutItem(item.id)}
                            className="shrink-0 rounded-full p-1 text-dark-gray/70 hover:bg-sand hover:text-terracotta"
                            aria-label={`Quitar ${item.nombre}`}
                          >
                            <IconTrash className="h-4 w-4" />
                          </button>
                        </div>
                        {lockedByDesigns && (
                          <div className="mt-1 flex flex-wrap gap-1">
                            {item.disenos_urls!.map((url, index) => (
                              <img
                                key={`${item.id}-design-${index}-${url}`}
                                src={url}
                                alt={`${item.nombre} diseño ${index + 1}`}
                                className="h-6 w-6 rounded-full border border-line object-cover"
                              />
                            ))}
                          </div>
                        )}
                        <div className="mt-1 flex items-center justify-between gap-2">
                          {!lockedByDesigns && item.stock > 1 ? (
                            <div className="app-stepper">
                              <button type="button" onClick={() => updateItemQuantity(item.id, item.quantity - 1)} aria-label="Restar una unidad">
                                <IconMinus className="h-3.5 w-3.5" />
                              </button>
                              <span>{item.quantity}</span>
                              <button
                                type="button"
                                onClick={() => updateItemQuantity(item.id, item.quantity + 1)}
                                disabled={item.quantity >= item.stock}
                                aria-label="Sumar una unidad"
                              >
                                <IconPlus className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          ) : (
                            <span className="text-xs text-dark-gray">{formatPrice(precioCompra)} c/u</span>
                          )}
                          <span className="text-right text-sm">
                            {tieneDescuento && (
                              <span className="block text-xs text-dark-gray/70 line-through">{formatPrice(precioOriginal * item.quantity)}</span>
                            )}
                            <span className="font-bold">{formatPrice(precioCompra * item.quantity)}</span>
                          </span>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>

              <dl className="mt-5 space-y-2 border-t border-line pt-4 text-sm">
                <div className="flex justify-between">
                  <dt>Productos</dt>
                  <dd>{formatCurrencyArs(subtotal + totalSavings)}</dd>
                </div>
                {totalSavings > 0 && (
                  <div className="flex justify-between font-semibold text-sage">
                    <dt>Descuentos</dt>
                    <dd>-{formatCurrencyArs(Number(totalSavings.toFixed(2)))}</dd>
                  </div>
                )}
                <div className="flex justify-between">
                  <dt>Envío</dt>
                  <dd>{selectedRate ? formatCurrencyArs(shippingCost) : <span className="text-dark-gray">A elegir</span>}</dd>
                </div>
                <div className="flex items-baseline justify-between border-t border-line pt-3">
                  <dt className="text-base font-semibold">Total</dt>
                  <dd className="text-2xl font-bold">{formatCurrencyArs(total)}</dd>
                </div>
              </dl>

              <button className="app-btn-cta mt-5 w-full py-4! text-base" onClick={pay} disabled={!canPay}>
                <IconLock className="h-4 w-4" />
                {paying ? "Llevándote a Mercado Pago..." : `Pagar ${formatPrice(total)}`}
              </button>
              {payHint && <p className="mt-2 text-center text-xs text-terracotta">{payHint}</p>}
              <p className="mt-3 text-center text-xs text-dark-gray">
                Pagás de forma segura en Mercado Pago. Te mandamos la confirmación por mail.
              </p>
            </aside>
          </div>
        )}

        {isAddressModalOpen && (
          <AppModal>
            <div className="app-modal-backdrop">
              <div className="app-modal-card max-w-lg p-5 sm:p-6">
                <h3 className="app-display text-2xl">Nueva dirección</h3>
                <p className="mt-1 text-sm text-dark-gray">La usamos para calcular el envío y mandarte tu pedido.</p>

                <form className="mt-4 grid gap-3" onSubmit={handleAddressSubmit(submitNewAddress)}>
                  <div>
                    <label className="mb-1 block text-sm text-dark-gray">Código postal</label>
                    <input
                      className="app-input"
                      placeholder="Ej: X5000"
                      {...registerAddress("cod_postal_destino", {
                        required: "Completá el código postal",
                        maxLength: 16,
                      })}
                    />
                    {addressErrors.cod_postal_destino && (
                      <p className="mt-1 text-xs text-red-600">{addressErrors.cod_postal_destino.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="mb-1 block text-sm text-dark-gray">Calle</label>
                    <input
                      className="app-input"
                      placeholder="Ej: Av. Colón"
                      {...registerAddress("calle", {
                        required: "Completá la calle",
                        maxLength: 128,
                      })}
                    />
                    {addressErrors.calle && (
                      <p className="mt-1 text-xs text-red-600">{addressErrors.calle.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="mb-1 block text-sm text-dark-gray">Altura</label>
                    <input
                      className="app-input"
                      placeholder="Ej: 1234"
                      inputMode="numeric"
                      {...registerAddress("altura", {
                        required: "Completá la altura",
                        pattern: {
                          value: /^\d+$/,
                          message: "La altura debe ser numérica",
                        },
                        maxLength: 10,
                      })}
                    />
                    {addressErrors.altura && (
                      <p className="mt-1 text-xs text-red-600">{addressErrors.altura.message}</p>
                    )}
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-sm text-dark-gray">Piso</label>
                      <input
                        className="app-input"
                        placeholder="Ej: 3"
                        inputMode="numeric"
                        {...registerAddress("piso", {
                          setValueAs: (value) => {
                            const parsed = Number(value);
                            return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
                          },
                          min: {
                            value: 1,
                            message: "El piso debe ser mayor a 0",
                          },
                        })}
                      />
                      {addressErrors.piso && (
                        <p className="mt-1 text-xs text-red-600">{addressErrors.piso.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="mb-1 block text-sm text-dark-gray">Departamento</label>
                      <input
                        className="app-input"
                        placeholder="Ej: A"
                        maxLength={10}
                        {...registerAddress("departamento")}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm text-dark-gray">Provincia</label>
                    <select
                      className="app-input"
                      {...registerAddress("id_provincia", {
                        valueAsNumber: true,
                        required: "Seleccioná una provincia",
                        validate: (value) => value > 0 || "Seleccioná una provincia",
                      })}
                    >
                      <option value={0}>Seleccionar provincia...</option>
                      {provincias.map((provincia) => (
                        <option key={provincia.id} value={provincia.id}>
                          {provincia.nombre}
                        </option>
                      ))}
                    </select>
                    {addressErrors.id_provincia && (
                      <p className="mt-1 text-xs text-red-600">{addressErrors.id_provincia.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="mb-1 block text-sm text-dark-gray">Ciudad</label>
                    <select
                      className="app-input"
                      {...registerAddress("id_ciudad", {
                        valueAsNumber: true,
                        required: "Seleccioná una ciudad",
                        validate: (value) => value > 0 || "Seleccioná una ciudad",
                      })}
                    >
                      <option value={0}>Seleccionar ciudad...</option>
                      {ciudades.map((ciudad) => (
                        <option key={ciudad.id} value={ciudad.id}>
                          {ciudad.nombre}
                        </option>
                      ))}
                    </select>
                    {addressErrors.id_ciudad && (
                      <p className="mt-1 text-xs text-red-600">{addressErrors.id_ciudad.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="mb-1 block text-sm text-dark-gray">Observaciones</label>
                    <textarea
                      className="app-input min-h-24 resize-y"
                      placeholder="Ej: Dejar en la puerta"
                      {...registerAddress("observaciones")}
                    />
                  </div>

                  <div className="mt-5 flex justify-end gap-2">
                    <button type="button" className="app-btn-secondary" onClick={closeAddressModal} disabled={creatingAddress}>
                      Cancelar
                    </button>
                    <button type="submit" className="app-btn-cta" disabled={creatingAddress}>
                      {creatingAddress ? "Guardando..." : "Guardar y continuar"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </AppModal>
        )}
    </main>
  );
}

