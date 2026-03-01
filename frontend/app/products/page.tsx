"use client";

import Link from "next/link";
import { useProductsCatalog } from "@/src/hooks/useProductsCatalog";
import { toNumber } from "@/src/utils/formatters";
import LoadingState from "@/src/components/ui/LoadingState";
import ErrorState from "@/src/components/ui/ErrorState";
import EmptyState from "@/src/components/ui/EmptyState";
import ImagePlaceholder from "@/src/components/ui/ImagePlaceholder";

export default function ProductsPage() {
  const {
    products,
    loading,
    error,
    hasProducts,
    totalItems,
    activeImageByProduct,
    addProductToCart,
    goToCheckout,
  } = useProductsCatalog();

  return (
    <main className="app-page">
      <div className="app-container mx-auto max-w-6xl">
      <header className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="app-title text-2xl">Productos</h1>
          <p className="app-subtitle text-sm">Explorá el catálogo y agregá al carrito.</p>
        </div>
        <button
          onClick={goToCheckout}
          className="app-btn-primary"
        >
          Carrito ({totalItems})
        </button>
      </header>

      {loading && <LoadingState message="Cargando productos..." />}
      {error && <ErrorState message={error} />}

      {!loading && !error && !hasProducts && <EmptyState message="No hay productos disponibles." />}

      {!loading && !error && hasProducts && (
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => {
            const stock = toNumber(product.stock);
            const precio = toNumber(product.precio);

            return (
              <article key={product.id} className="app-panel">
                {product.fotos?.length ? (
                  <img
                    src={product.fotos[activeImageByProduct[product.id] ?? 0]?.url}
                    alt={product.nombre}
                    className="mb-3 h-48 w-full rounded-md border border-earth-brown/40 bg-white object-contain p-2"
                  />
                ) : (
                  <ImagePlaceholder className="mb-3 flex h-44 w-full items-center justify-center rounded-md bg-zinc-100" />
                )}

                <h2 className="text-lg font-semibold">{product.nombre}</h2>
                <p className="mt-1 text-sm text-zinc-600 line-clamp-2">{product.descripcion}</p>
                <p className="mt-2 text-sm">Stock: {stock}</p>
                <p className="text-lg font-bold">${precio.toFixed(2)}</p>

                <div className="mt-4 flex gap-2">
                  <Link href={`/products/${product.id}`} className="app-btn-secondary text-sm">
                    Ver detalle
                  </Link>
                  <button
                    onClick={() => addProductToCart(product)}
                    disabled={stock <= 0}
                    className="app-btn-primary text-sm disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Agregar
                  </button>
                </div>
              </article>
            );
          })}
        </section>
      )}
      </div>
    </main>
  );
}
