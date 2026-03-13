"use client";

import Link from "next/link";
import { useProductsCatalog } from "@/features/products/hooks/useProductsCatalog";
import { toNumber } from "@/shared/lib/formatters";
import LoadingState from "@/shared/ui/LoadingState";
import ErrorState from "@/shared/ui/ErrorState";
import EmptyState from "@/shared/ui/EmptyState";
import ImagePlaceholder from "@/shared/ui/ImagePlaceholder";
import PaginationControls from "@/shared/ui/PaginationControls";

export default function ProductsPageClient() {
  const {
    products,
    categorias,
    filteredSubcategorias,
    loading,
    error,
    hasProducts,
    hasActiveFilters,
    registerFilters,
    page,
    pageSize,
    totalPages,
    totalItemsCount,
    totalItems,
    activeImageByProduct,
    applyFilters,
    clearFilters,
    goToPage,
    addProductToCart,
    goToCheckout,
  } = useProductsCatalog();

  return (
    <main className="app-page">
      <div className="app-container mx-auto max-w-360">
      <header className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="app-title text-2xl">Productos artesanales online</h1>
          <p className="app-subtitle text-sm">Explora regalos originales, deco artesanal y productos hechos a mano en Argentina.</p>
        </div>
        <button
          onClick={goToCheckout}
          className="app-btn-primary cursor-pointer"
        >
          Carrito ({totalItems})
        </button>
      </header>

      {loading && <LoadingState message="Cargando productos..." />}
      {error && <ErrorState message={error} />}

      {!loading && !error && !hasProducts && <EmptyState message="No hay productos disponibles." />}

      {!loading && !error && (
        <section className="grid grid-cols-1 gap-4 lg:grid-cols-[280px_1fr]">
          <aside className="app-panel h-fit">
            <h2 className="app-title text-lg">Filtros de busqueda</h2>

            <form className="mt-4 space-y-3" onSubmit={applyFilters}>
              <div>
                <label className="mb-1 block text-sm text-dark-gray">Nombre</label>
                <input
                  className="app-input"
                  {...registerFilters("nombre")}
                  placeholder="Buscar por nombre"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm text-dark-gray">Categoria</label>
                <select className="app-input" {...registerFilters("id_categoria")}>
                  <option value="">Todas</option>
                  {categorias.map((categoria) => (
                    <option key={categoria.id} value={categoria.id}>
                      {categoria.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm text-dark-gray">Subcategoria</label>
                <select className="app-input" {...registerFilters("id_subcategoria")}>
                  <option value="">Todas</option>
                  {filteredSubcategorias.map((subcategoria) => (
                    <option key={subcategoria.id} value={subcategoria.id}>
                      {subcategoria.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="mb-1 block text-sm text-dark-gray">Precio min</label>
                  <input
                    type="number"
                    step="0.01"
                    className="app-input"
                    {...registerFilters("precio_min")}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-dark-gray">Precio max</label>
                  <input
                    type="number"
                    step="0.01"
                    className="app-input"
                    {...registerFilters("precio_max")}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <button type="submit" className="app-btn-primary">
                  Filtrar
                </button>
                <button type="button" className="app-btn-secondary" onClick={clearFilters}>
                  Limpiar
                </button>
              </div>
            </form>
          </aside>

          <div>
            {!hasProducts ? (
              <EmptyState message={hasActiveFilters ? "No hay productos para esos filtros." : "No hay productos disponibles."} />
            ) : (
              <>
                <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {products.map((product) => {
                    const stock = toNumber(product.stock);
                    const precio = toNumber(product.precio);
                    const hasDiscount =
                      typeof product.descuento_aplicado?.porcentaje === "number"
                      && Number(product.descuento_aplicado.porcentaje) > 0;
                    const precioFinal = hasDiscount ? toNumber(product.precio_final ?? precio) : precio;
                    const discountPercentage = hasDiscount ? Number(product.descuento_aplicado?.porcentaje ?? 0) : 0;

                    return (
                      <article key={product.id} className="app-panel">
                        {product.fotos?.length ? (
                          <div className="relative mb-3">
                            {hasDiscount && (
                              <span className="absolute left-2 top-2 z-10 rounded-full bg-earth-brown px-2 py-1 text-xs font-semibold text-cream">
                                {discountPercentage}% OFF
                              </span>
                            )}
                            <img
                              key={`${product.id}-${activeImageByProduct[product.id] ?? 0}`}
                              src={product.fotos[activeImageByProduct[product.id] ?? 0]?.url}
                              alt={`${product.nombre} artesanal - Tribal Trend`}
                              width={800}
                              height={800}
                              loading="lazy"
                              decoding="async"
                              sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                              className="app-fade-swap h-48 w-full rounded-md border border-earth-brown/40 bg-white object-contain p-2"
                            />
                          </div>
                        ) : (
                          <ImagePlaceholder className="mb-3 flex h-44 w-full items-center justify-center rounded-md bg-zinc-100" />
                        )}

                        <h2 className="text-lg font-semibold">{product.nombre}</h2>
                        <p className="mt-1 text-sm text-zinc-600">
                          {product.categoria?.nombre ?? "-"} / {product.subcategoria?.nombre ?? "-"}
                        </p>
                        {hasDiscount ? (
                          <div className="mt-2">
                            <p className="text-sm text-zinc-500 line-through">${precio.toFixed(2)}</p>
                            <p className="text-lg font-bold text-earth-brown">${precioFinal.toFixed(2)}</p>
                          </div>
                        ) : (
                          <p className="mt-2 text-lg font-bold">${precio.toFixed(2)}</p>
                        )}

                        <div className="mt-4 flex gap-2">
                          <Link href={`/products/${product.id}`} className="app-btn-secondary text-sm" aria-label={`Ver detalle de ${product.nombre}`}>
                            Ver detalle
                          </Link>
                          <button
                            onClick={() => addProductToCart(product)}
                            disabled={stock <= 0}
                            className="app-btn-primary cursor-pointer text-sm disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            Agregar
                          </button>
                        </div>
                      </article>
                    );
                  })}
                </section>

                <PaginationControls
                  page={page}
                  totalPages={totalPages}
                  totalItems={totalItemsCount}
                  pageSize={pageSize}
                  onPageChange={goToPage}
                />
              </>
            )}
          </div>
        </section>
      )}
      </div>
    </main>
  );
}
