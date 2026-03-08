"use client";

import Link from "next/link";
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
    goToPrevImage,
    goToNextImage,
    addCurrentProductToCart,
    goToCheckout,
  } = useProductDetail(productId);

  const hasDiscount =
    !!product
    && typeof product.descuento_aplicado?.porcentaje === "number"
    && Number(product.descuento_aplicado.porcentaje) > 0;
  const precioBase = product ? toNumber(product.precio) : 0;
  const precioFinal = product ? toNumber(product.precio_final ?? precioBase) : 0;
  const discountPercentage = hasDiscount ? Number(product?.descuento_aplicado?.porcentaje ?? 0) : 0;

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
          <section className="app-panel grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              {activeFoto?.url ? (
                <>
                  <div className="relative flex min-h-72 w-full items-center justify-center rounded-lg border border-earth-brown/40 bg-white p-2">
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
                      className="app-fade-swap max-h-120 w-full object-contain"
                    />
                  </div>

                  {fotos.length > 1 && (
                    <div className="mt-3 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        className="app-btn-secondary"
                        onClick={goToPrevImage}
                      >
                        Anterior
                      </button>

                      <div className="flex items-center gap-2">
                        {fotos.map((foto, index) => (
                          <button
                            key={foto.id}
                            type="button"
                            className={`h-2.5 w-2.5 rounded-full ${
                              index === activeImageIndex ? "bg-earth-brown" : "bg-earth-brown/30"
                            }`}
                            onClick={() => setActiveImageIndex(index)}
                            aria-label={`Ver imagen ${index + 1}`}
                          />
                        ))}
                      </div>

                      <button
                        type="button"
                        className="app-btn-secondary"
                        onClick={goToNextImage}
                      >
                        Siguiente
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <ImagePlaceholder
                  className="flex h-96 w-full items-center justify-center rounded-lg bg-zinc-100"
                  textClassName="text-zinc-500"
                />
              )}
            </div>

            <div>
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
