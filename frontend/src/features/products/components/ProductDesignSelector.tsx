"use client";

import { useMemo, useState } from "react";
import type { ProductDiseno, ProductFoto } from "@/types/products";

type ProductDesignSelectorProps = {
  fotos: ProductFoto[];
  disenos?: ProductDiseno[];
  quantity: number;
  maxQuantity: number;
  selectedUrls: string[];
  onQuantityChange: (quantity: number) => void;
  onToggleUrl: (url: string) => void;
  onDesignQuantityChange?: (url: string, quantity: number) => void;
};

export default function ProductDesignSelector({
  fotos,
  disenos,
  quantity,
  maxQuantity,
  selectedUrls,
  onQuantityChange,
  onDesignQuantityChange,
}: ProductDesignSelectorProps) {
  const [activeIndex, setActiveIndex] = useState(0);
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
        nombre: `Diseno ${index + 1}`,
        precio: null as number | null,
        stock: Math.max(0, maxQuantity),
      }));
  const activeFoto = designItems[Math.min(activeIndex, Math.max(designItems.length - 1, 0))];
  const selectedCounts = useMemo(
    () =>
      selectedUrls.reduce((acc, url) => {
        acc.set(url, (acc.get(url) ?? 0) + 1);
        return acc;
      }, new Map<string, number>()),
    [selectedUrls],
  );

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

  const goToPrev = () => {
    if (!designItems.length) {
      return;
    }
    setActiveIndex((prev) => (prev === 0 ? designItems.length - 1 : prev - 1));
  };

  const goToNext = () => {
    if (!designItems.length) {
      return;
    }
    setActiveIndex((prev) => (prev === designItems.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="rounded-lg border border-line bg-white/75 p-3">
      <p className="text-sm font-semibold text-dark-gray">
        Este producto tiene multiples disenos, cuantos productos queres? Que disenos queres comprar?
      </p>

      <p className="mt-3 text-sm text-dark-gray">Cantidad total: {quantity}</p>

      {activeFoto ? (
        <div className="mt-3">
          <div className="relative overflow-hidden rounded-md border border-earth-brown/35 bg-white">
            <button
              type="button"
              className="absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/85 px-2 py-1 text-sm font-bold text-earth-brown shadow"
              onClick={goToPrev}
              aria-label="Foto anterior"
            >
              {"<"}
            </button>
            <button
              type="button"
              className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/85 px-2 py-1 text-sm font-bold text-earth-brown shadow"
              onClick={goToNext}
              aria-label="Foto siguiente"
            >
              {">"}
            </button>
            <button
              type="button"
              className="relative block h-56 w-full"
              onClick={() => setUrlQuantity(activeFoto.url, (selectedCounts.get(activeFoto.url) ?? 0) + 1)}
              aria-label="Ver diseno visible"
            >
              <img src={activeFoto.url} alt={activeFoto.nombre} className="h-full w-full object-contain p-2" />
              {(selectedCounts.get(activeFoto.url) ?? 0) > 0 && (
                <span className="absolute right-3 top-3 inline-flex h-8 min-w-8 items-center justify-center rounded-full bg-earth-brown px-2 text-sm font-bold text-cream shadow">
                  x{selectedCounts.get(activeFoto.url)}
                </span>
              )}
            </button>
          </div>
          <div className="mt-2">
            <p className="text-sm font-semibold text-dark-gray">{activeFoto.nombre}</p>
            {activeFoto.precio !== null && <p className="text-sm text-earth-brown">${activeFoto.precio.toFixed(2)}</p>}
            <div className="mt-2 max-w-40">
              <label className="mb-1 block text-xs text-dark-gray">Cantidad de este diseno</label>
              <input
                type="number"
                min={0}
                max={Math.max(0, activeFoto.stock)}
                value={selectedCounts.get(activeFoto.url) ?? 0}
                onChange={(event) => setUrlQuantity(activeFoto.url, Number(event.target.value))}
                className="app-input"
              />
              <p className="app-subtitle mt-1 text-xs">Stock disponible: {activeFoto.stock}</p>
            </div>
          </div>

          <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
            {designItems.map((item, index) => {
              const selectedCount = selectedCounts.get(item.url) ?? 0;
              return (
                <button
                  key={item.id}
                  type="button"
                  className={`relative h-16 w-16 shrink-0 rounded-md border bg-white p-1 ${
                    index === activeIndex ? "border-earth-brown ring-2 ring-earth-brown/25" : "border-line"
                  }`}
                  onClick={() => setActiveIndex(index)}
                  aria-label={`Ver diseno ${index + 1}`}
                >
                  <img src={item.url} alt={item.nombre} className="h-full w-full object-contain" />
                  {selectedCount > 0 && (
                    <span className="absolute right-1 top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-earth-brown px-1 text-xs font-bold text-cream">
                      {selectedCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <p className="mt-3 text-sm text-red-600">Este producto no tiene fotos disponibles para seleccionar disenos.</p>
      )}

      <p className="mt-2 text-xs text-dark-gray">Seleccionados: {selectedUrls.length}</p>
    </div>
  );
}
