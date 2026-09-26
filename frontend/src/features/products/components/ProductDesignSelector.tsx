"use client";

import { useMemo } from "react";
import type { ProductDiseno, ProductFoto } from "@/types/products";
import { formatPrice } from "@/shared/lib/formatters";
import { IconCheck, IconMinus, IconPlus } from "@/shared/ui/Icons";

type ProductDesignSelectorProps = {
  fotos: ProductFoto[];
  disenos?: ProductDiseno[];
  quantity: number;
  maxQuantity: number;
  selectedUrls: string[];
  onQuantityChange: (quantity: number) => void;
  onToggleUrl: (url: string) => void;
  onDesignQuantityChange?: (url: string, quantity: number) => void;
  /** Se llama al tocar un diseño, para mostrarlo en grande en la galería. */
  onPreview?: (url: string) => void;
};

export default function ProductDesignSelector({
  fotos,
  disenos,
  maxQuantity,
  selectedUrls,
  onQuantityChange,
  onDesignQuantityChange,
  onPreview,
}: ProductDesignSelectorProps) {
  const designItems = disenos?.length
    ? disenos.filter((diseno) => Boolean(diseno.url_foto)).map((diseno) => ({
        id: diseno.id,
        url: diseno.url_foto as string,
        nombre: diseno.nombre,
        precio: Number(diseno.precio),
        stock: Number.isFinite(Number(diseno.stock)) ? Math.max(0, Number(diseno.stock)) : 0,
      }))
    : fotos.map((foto, index) => ({
        id: foto.id,
        url: foto.url,
        nombre: `Diseño ${index + 1}`,
        precio: null as number | null,
        stock: Math.max(0, maxQuantity),
      }));
  const selectedCounts = useMemo(
    () =>
      selectedUrls.reduce((acc, url) => {
        acc.set(url, (acc.get(url) ?? 0) + 1);
        return acc;
      }, new Map<string, number>()),
    [selectedUrls],
  );
  const selectedTotal = selectedUrls.length;

  const setUrlQuantity = (url: string, nextQuantity: number) => {
    const item = designItems.find((design) => design.url === url);
    const safeQuantity = Math.min(
      Math.max(0, Math.floor(nextQuantity)),
      Math.max(0, Number(item?.stock ?? 0)),
    );
    if (onDesignQuantityChange) {
      onDesignQuantityChange(url, safeQuantity);
      return;
    }
    onQuantityChange(selectedUrls.filter((selectedUrl) => selectedUrl !== url).length + safeQuantity);
  };

  const handlePick = (url: string, stock: number) => {
    onPreview?.(url);
    const count = selectedCounts.get(url) ?? 0;
    if (count < stock) {
      setUrlQuantity(url, count + 1);
      return;
    }
    // Con una sola unidad, volver a tocar la foto la deselecciona.
    if (stock === 1) {
      setUrlQuantity(url, 0);
    }
  };

  if (!designItems.length) {
    return <p className="text-sm text-red-600">Este producto no tiene fotos disponibles para seleccionar diseños.</p>;
  }

  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-sm font-semibold text-black">Elegí tu diseño</p>
        <p className="text-xs text-dark-gray" aria-live="polite">
          {selectedTotal === 0 ? "Ninguno elegido" : `${selectedTotal} ${selectedTotal === 1 ? "elegido" : "elegidos"}`}
        </p>
      </div>
      <p className="mt-0.5 text-xs text-dark-gray">Tocá la foto para sumarla. Podés combinar varios.</p>

      <ul className="mt-3 grid grid-cols-3 gap-2.5 sm:grid-cols-4">
        {designItems.map((item) => {
          const count = selectedCounts.get(item.url) ?? 0;
          const isSoldOut = item.stock <= 0;

          return (
            <li
              key={item.id}
              className={`rounded-2xl border bg-white/85 p-1.5 transition ${
                count > 0 ? "border-terracotta ring-2 ring-terracotta/25" : "border-line hover:border-earth-brown/60"
              }`}
            >
              <button
                type="button"
                className="relative block aspect-square w-full overflow-hidden rounded-xl disabled:cursor-not-allowed"
                onClick={() => handlePick(item.url, item.stock)}
                disabled={isSoldOut}
                aria-pressed={count > 0}
                aria-label={`${count > 0 ? "Quitar o sumar" : "Elegir"} diseño ${item.nombre}`}
              >
                <img src={item.url} alt={item.nombre} className="h-full w-full object-cover" loading="lazy" />
                {count > 0 && (
                  <span className="absolute right-1.5 top-1.5 grid h-6 min-w-6 place-items-center rounded-full bg-terracotta px-1 text-xs font-bold text-cream shadow">
                    {item.stock === 1 ? <IconCheck className="h-3.5 w-3.5" /> : `x${count}`}
                  </span>
                )}
                {isSoldOut && (
                  <span className="absolute inset-0 grid place-items-center bg-cream/70 text-[11px] font-semibold uppercase tracking-wider text-dark-gray">
                    Agotado
                  </span>
                )}
              </button>
              <p className="mt-1.5 truncate px-0.5 text-xs font-semibold first-letter:uppercase">{item.nombre}</p>
              {item.precio !== null && Number.isFinite(item.precio) && (
                <p className="px-0.5 text-xs text-earth-brown">{formatPrice(item.precio)}</p>
              )}
              {item.stock > 1 && count > 0 && (
                <div className="app-stepper mt-1.5 w-full justify-between">
                  <button type="button" onClick={() => setUrlQuantity(item.url, count - 1)} aria-label={`Restar ${item.nombre}`}>
                    <IconMinus className="h-3.5 w-3.5" />
                  </button>
                  <span>{count}</span>
                  <button
                    type="button"
                    onClick={() => setUrlQuantity(item.url, count + 1)}
                    disabled={count >= item.stock}
                    aria-label={`Sumar ${item.nombre}`}
                  >
                    <IconPlus className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
