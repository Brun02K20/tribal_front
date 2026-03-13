"use client";

import Link from "next/link";
import { useState } from "react";
import { useProductDetail } from "@/features/products/hooks/useProductDetail";
import ProductResenasSection from "@/features/products/components/ProductResenasSection";
import { toNumber } from "@/shared/lib/formatters";
import LoadingState from "@/shared/ui/LoadingState";
import ErrorState from "@/shared/ui/ErrorState";
import ImagePlaceholder from "@/shared/ui/ImagePlaceholder";

type ProductPageClientProps = {
  productId: number;
};

export default function ProductPageClient({ productId }: ProductPageClientProps) {
  const {
    product,
    quantity,
    loading,
    error,
    stock,
    fotos,
    activeFoto,
    activeImageIndex,
    totalItems,
    setActiveImageIndex,
    updateQuantity,
    addCurrentProductToCart,
    goToCheckout,
  } = useProductDetail(productId);
  const [isZoomActive, setIsZoomActive] = useState(false);
  const [zoomOrigin, setZoomOrigin] = useState({ x: 50, y: 50 });

  const hasDiscount =
    !!product
    && typeof product.descuento_aplicado?.porcentaje === "number"
    && Number(product.descuento_aplicado.porcentaje) > 0;
  const precioBase = product ? toNumber(product.precio) : 0;
  const precioFinal = product ? toNumber(product.precio_final ?? precioBase) : 0;
  const discountPercentage = hasDiscount ? Number(product?.descuento_aplicado?.porcentaje ?? 0) : 0;

  const updateZoomOrigin = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    if (!rect.width || !rect.height) {
      return;
    }

    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    setZoomOrigin({
      x: Math.max(0, Math.min(100, x)),
      y: Math.max(0, Math.min(100, y)),
    });
  };

  return (
    <main className="app-page">
      <div className="app-container mx-auto max-w-360">
      <header className="mb-6 flex items-center justify-between">
        <Link href="/products" className="app-btn-secondary text-sm">
          Volver
        </Link>
        <button onClick={goToCheckout} className="app-btn-primary cursor-pointer">
          Carrito ({totalItems})
        </button>
      </header>

      {loading && <LoadingState message="Cargando producto..." />}
      {error && <ErrorState message={error} />}

      {!loading && !error && product && (
        <>
          <section className="app-panel grid grid-cols-1 gap-6 xl:grid-cols-[84px_minmax(0,1fr)_minmax(360px,460px)]">
            <div className="order-2 flex gap-2 overflow-x-auto xl:order-1 xl:flex-col xl:overflow-visible">
              {fotos.map((foto, index) => (
                <button
                  key={foto.id}
                  type="button"
                  onMouseEnter={() => setActiveImageIndex(index)}
                  onFocus={() => setActiveImageIndex(index)}
                  onClick={() => setActiveImageIndex(index)}
                  className={`relative h-18 w-18 shrink-0 overflow-hidden rounded-md border bg-white p-1 transition ${
                    index === activeImageIndex
                      ? "border-earth-brown ring-2 ring-earth-brown/25"
                      : "border-line hover:border-earth-brown/50"
                  }`}
                  aria-label={`Ver imagen ${index + 1}`}
                >
                  <img
                    src={foto.url}
                    alt={`${product.nombre} miniatura ${index + 1}`}
                    className="h-full w-full object-contain"
                  />
                </button>
              ))}
            </div>

            <div className="order-1 xl:order-2">
              {activeFoto?.url ? (
                <>
                  <div
                    className="relative flex min-h-72 w-full items-center justify-center overflow-hidden rounded-lg border border-earth-brown/40 bg-white p-2"
                    onMouseMove={updateZoomOrigin}
                    onMouseEnter={() => setIsZoomActive(true)}
                    onMouseLeave={() => setIsZoomActive(false)}
                  >
                    {hasDiscount && (
                      <span className="absolute left-2 top-2 z-10 rounded-full bg-earth-brown px-2 py-1 text-xs font-semibold text-cream">
                        {discountPercentage}% OFF
                      </span>
                    )}
                    <img
                      key={`${product.id}-${activeImageIndex}`}
                      src={activeFoto.url}
                      alt={`${product.nombre} artesanal - imagen ${activeImageIndex + 1}`}
                      width={1200}
                      height={1200}
                      loading="eager"
                      decoding="async"
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="app-fade-swap max-h-120 w-full origin-center object-contain transition-transform duration-150"
                      style={{
                        transformOrigin: `${zoomOrigin.x}% ${zoomOrigin.y}%`,
                        transform: isZoomActive ? "scale(2.15)" : "scale(1)",
                        cursor: isZoomActive ? "zoom-out" : "zoom-in",
                      }}
                    />
                  </div>
                </>
              ) : (
                <ImagePlaceholder
                  className="flex h-96 w-full items-center justify-center rounded-lg bg-zinc-100"
                  textClassName="text-zinc-500"
                />
              )}
            </div>

            <div className="order-3">
              <h1 className="text-2xl font-bold">{product.nombre}</h1>
              <p className="mt-2 text-zinc-700">{product.descripcion}</p>
              <p className="mt-4 text-sm">Categoria: {product.categoria?.nombre || "-"}</p>
              <p className="text-sm">Subcategoria: {product.subcategoria?.nombre || "-"}</p>
              <p className="mt-2 text-sm">Stock disponible: {stock}</p>
              {hasDiscount ? (
                <div className="mt-2">
                  <p className="text-base text-zinc-500 line-through">${precioBase.toFixed(2)}</p>
                  <p className="text-3xl font-bold text-earth-brown">${precioFinal.toFixed(2)}</p>
                </div>
              ) : (
                <p className="mt-2 text-3xl font-bold">${precioBase.toFixed(2)}</p>
              )}

              <div className="mt-5 flex items-center gap-3">
                <label htmlFor="cantidad" className="text-sm font-medium">Cantidad</label>
                <input
                  id="cantidad"
                  type="number"
                  min={1}
                  max={Math.max(stock, 1)}
                  value={quantity}
                  onChange={(event) => updateQuantity(Number(event.target.value))}
                  className="app-input w-20"
                  placeholder="Ej: 1"
                />
              </div>

              <button
                onClick={addCurrentProductToCart}
                disabled={stock <= 0}
                className="app-btn-primary mt-6 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
              >
                Agregar al carrito
              </button>
            </div>
          </section>

          <ProductResenasSection productId={product.id} />
        </>
      )}
      </div>
    </main>
  );
}
