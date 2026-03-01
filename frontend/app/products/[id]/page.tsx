"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useProductDetail } from "@/src/hooks/useProductDetail";
import { toNumber } from "@/src/utils/formatters";
import LoadingState from "@/src/components/ui/LoadingState";
import ErrorState from "@/src/components/ui/ErrorState";
import ImagePlaceholder from "@/src/components/ui/ImagePlaceholder";

export default function ProductPage() {
  const params = useParams<{ id: string }>();
  const productId = Number(params.id);
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
        <section className="app-panel grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            {activeFoto?.url ? (
              <>
                <div className="relative flex min-h-72 w-full items-center justify-center rounded-lg border border-earth-brown/40 bg-white p-2">
                  <img
                    src={activeFoto.url}
                    alt={`${product.nombre} - imagen ${activeImageIndex + 1}`}
                    className="max-h-120 w-full object-contain"
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
            <p className="mt-4 text-sm">Categoría: {product.categoria?.nombre || "-"}</p>
            <p className="text-sm">Subcategoría: {product.subcategoria?.nombre || "-"}</p>
            <p className="mt-2 text-sm">Stock disponible: {stock}</p>
            <p className="mt-2 text-3xl font-bold">${toNumber(product.precio).toFixed(2)}</p>

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
      )}
      </div>
    </main>
  );
}
