"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useCart } from "@/shared/providers/CartContext";
import { useAuth } from "@/shared/providers/AuthContext";
import { formatPrice } from "@/shared/lib/formatters";
import AppModal from "@/shared/ui/AppModal";
import ImagePlaceholder from "@/shared/ui/ImagePlaceholder";
import { IconArrowRight, IconBag, IconClose, IconLock, IconMinus, IconPlus, IconTrash, IconTruck } from "@/shared/ui/Icons";

export default function CartDrawer() {
  const { items, totalItems, subtotal, isCartOpen, closeCart, updateQuantity, removeItem } = useCart();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

  const savings = items.reduce((acc, item) => {
    const original = Number(item.precio_original ?? item.precio);
    return acc + Math.max(0, original - Number(item.precio)) * item.quantity;
  }, 0);

  // Cerrar al navegar a otra página.
  useEffect(() => {
    closeCart();
  }, [pathname, closeCart]);

  useEffect(() => {
    if (!isCartOpen) {
      return;
    }

    closeButtonRef.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeCart();
      }
    };
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isCartOpen, closeCart]);

  const goToCheckout = () => {
    closeCart();
    if (!authLoading && !isAuthenticated) {
      router.push("/login?redirect=/checkout");
      return;
    }
    router.push("/checkout");
  };

  return (
    <AppModal>
      <div className="app-drawer-backdrop" data-open={isCartOpen} onClick={closeCart} aria-hidden="true" />
      <aside
        className="app-drawer"
        data-open={isCartOpen}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-drawer-title"
        aria-hidden={!isCartOpen}
        inert={!isCartOpen}
      >
        <header className="flex items-center justify-between border-b border-line px-5 py-4">
          <div>
            <h2 id="cart-drawer-title" className="app-display text-2xl">Tu carrito</h2>
            <p className="text-xs text-dark-gray">
              {totalItems === 0 ? "Todavía no elegiste piezas" : `${totalItems} ${totalItems === 1 ? "pieza" : "piezas"}`}
            </p>
          </div>
          <button ref={closeButtonRef} type="button" className="app-icon-btn" onClick={closeCart} aria-label="Cerrar carrito">
            <IconClose />
          </button>
        </header>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
            <span className="grid h-20 w-20 place-items-center rounded-full bg-sand text-earth-brown">
              <IconBag className="h-9 w-9" />
            </span>
            <p className="app-display text-xl">Tu carrito está esperando algo especial</p>
            <p className="text-sm text-dark-gray">Cada pieza es única: la que te gusta hoy, puede no estar mañana.</p>
            <Link href="/products" className="app-btn-cta" onClick={closeCart}>
              Descubrir la colección <IconArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <>
            <ul className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
              {items.map((item) => {
                const lockedByDesigns = Boolean(item.disenos_urls?.length);
                const original = Number(item.precio_original ?? item.precio);
                const hasDiscount = original > Number(item.precio);

                return (
                  <li key={item.id} className="flex gap-3 rounded-2xl border border-line bg-white/80 p-2.5">
                    <Link href={`/products/${item.id}`} onClick={closeCart} className="shrink-0">
                      {item.fotoUrl ? (
                        <img src={item.fotoUrl} alt={item.nombre} className="h-24 w-20 rounded-xl object-cover" />
                      ) : (
                        <ImagePlaceholder
                          className="flex h-24 w-20 items-center justify-center rounded-xl bg-sand"
                          textClassName="text-[10px] text-dark-gray"
                        />
                      )}
                    </Link>
                    <div className="flex min-w-0 flex-1 flex-col">
                      <div className="flex items-start justify-between gap-2">
                        <Link
                          href={`/products/${item.id}`}
                          onClick={closeCart}
                          className="line-clamp-2 text-sm font-semibold capitalize hover:text-earth-brown"
                        >
                          {item.nombre}
                        </Link>
                        <button
                          type="button"
                          className="shrink-0 rounded-full p-1 text-dark-gray/70 hover:bg-sand hover:text-terracotta"
                          onClick={() => removeItem(item.id)}
                          aria-label={`Quitar ${item.nombre} del carrito`}
                        >
                          <IconTrash className="h-4 w-4" />
                        </button>
                      </div>
                      {lockedByDesigns && (
                        <div className="mt-1 flex gap-1">
                          {item.disenos_urls!.slice(0, 5).map((url, index) => (
                            <img
                              key={`${item.id}-${index}-${url}`}
                              src={url}
                              alt=""
                              className="h-6 w-6 rounded-full border border-line object-cover"
                            />
                          ))}
                        </div>
                      )}
                      <div className="mt-auto flex items-end justify-between gap-2 pt-2">
                        {lockedByDesigns || item.stock <= 1 ? (
                          <span className="text-xs text-dark-gray">
                            {item.quantity} {item.quantity === 1 ? "unidad" : "unidades"}
                          </span>
                        ) : (
                          <div className="app-stepper" aria-label={`Cantidad de ${item.nombre}`}>
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              aria-label="Restar una unidad"
                            >
                              <IconMinus className="h-3.5 w-3.5" />
                            </button>
                            <span>{item.quantity}</span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              disabled={item.quantity >= item.stock}
                              aria-label="Sumar una unidad"
                            >
                              <IconPlus className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        )}
                        <div className="text-right">
                          {hasDiscount && (
                            <p className="text-xs text-dark-gray/70 line-through">{formatPrice(original * item.quantity)}</p>
                          )}
                          <p className="font-bold">{formatPrice(Number(item.precio) * item.quantity)}</p>
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>

            <footer className="space-y-3 border-t border-line bg-white/70 px-5 py-4">
              {savings > 0 && (
                <p className="flex justify-between text-sm font-semibold text-sage">
                  <span>Estás ahorrando</span>
                  <span>-{formatPrice(savings)}</span>
                </p>
              )}
              <p className="flex items-baseline justify-between">
                <span className="text-sm text-dark-gray">Subtotal</span>
                <span className="text-2xl font-bold">{formatPrice(subtotal)}</span>
              </p>
              <p className="flex items-center gap-2 text-xs text-dark-gray">
                <IconTruck className="h-4 w-4 text-earth-brown" /> El envío se calcula en el próximo paso.
              </p>
              <button type="button" className="app-btn-cta w-full text-base" onClick={goToCheckout}>
                Finalizar compra <IconArrowRight className="h-4 w-4" />
              </button>
              <button
                type="button"
                className="w-full text-center text-sm text-earth-brown underline-offset-4 hover:underline"
                onClick={closeCart}
              >
                Seguir mirando piezas
              </button>
              <p className="flex items-center justify-center gap-1.5 text-[11px] text-dark-gray/80">
                <IconLock className="h-3.5 w-3.5" /> Pago seguro con Mercado Pago
              </p>
            </footer>
          </>
        )}
      </aside>
    </AppModal>
  );
}
