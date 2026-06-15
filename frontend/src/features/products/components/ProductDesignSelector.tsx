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
};

export default function ProductDesignSelector({
  fotos,
  disenos,
  quantity,
  maxQuantity,
  selectedUrls,
  onQuantityChange,
  onToggleUrl,
}: ProductDesignSelectorProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const designItems = disenos?.length
    ? disenos.map((diseno) => ({
        id: diseno.id,
        url: diseno.url_foto,
        nombre: diseno.nombre,
        precio: Number(diseno.precio),
      }))
    : fotos.map((foto, index) => ({
        id: foto.id,
        url: foto.url,
        nombre: `Diseño ${index + 1}`,
        precio: null as number | null,
      }));
  const activeFoto = designItems[Math.min(activeIndex, Math.max(designItems.length - 1, 0))];
  const selectedSet = useMemo(() => new Set(selectedUrls), [selectedUrls]);

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
        Este producto tiene múltiples diseños, cuantos productos queres? Que diseños queres comprar?
      </p>

      <div className="mt-3 max-w-36">
        <label className="mb-1 block text-xs text-dark-gray">Cantidad</label>
        <input
          type="number"
          min={1}
          max={Math.max(1, maxQuantity)}
          value={quantity}
          onChange={(event) => onQuantityChange(Number(event.target.value))}
          className="app-input"
        />
      </div>

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
              onClick={() => onToggleUrl(activeFoto.url)}
              aria-label="Seleccionar diseño visible"
            >
              <img
                src={activeFoto.url}
                alt={activeFoto.nombre}
                className="h-full w-full object-contain p-2"
              />
              {selectedSet.has(activeFoto.url) && (
                <span className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-earth-brown text-lg font-bold text-cream shadow">
                  ✓
                </span>
              )}
            </button>
          </div>
          <div className="mt-2">
            <p className="text-sm font-semibold text-dark-gray">{activeFoto.nombre}</p>
            {activeFoto.precio !== null && (
              <p className="text-sm text-earth-brown">${activeFoto.precio.toFixed(2)}</p>
            )}
          </div>

          <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
            {designItems.map((item, index) => {
              const isSelected = selectedSet.has(item.url);
              return (
                <button
                  key={item.id}
                  type="button"
                  className={`relative h-16 w-16 shrink-0 rounded-md border bg-white p-1 ${
                    index === activeIndex ? "border-earth-brown ring-2 ring-earth-brown/25" : "border-line"
                  }`}
                  onClick={() => {
                    setActiveIndex(index);
                    onToggleUrl(item.url);
                  }}
                  aria-label={`Seleccionar diseño ${index + 1}`}
                >
                  <img src={item.url} alt={item.nombre} className="h-full w-full object-contain" />
                  {isSelected && (
                    <span className="absolute right-1 top-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-earth-brown text-xs font-bold text-cream">
                      ✓
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <p className="mt-3 text-sm text-red-600">Este producto no tiene fotos disponibles para seleccionar diseños.</p>
      )}

      <p className="mt-2 text-xs text-dark-gray">
        Seleccionados: {selectedUrls.length}/{quantity}
      </p>
    </div>
  );
}
