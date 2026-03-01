"use client";

import Link from "next/link";
import { useProductsCatalog } from "@/features/products/hooks/useProductsCatalog";
import { toNumber } from "@/shared/lib/formatters";
import LoadingState from "@/shared/ui/LoadingState";
import ErrorState from "@/shared/ui/ErrorState";
import EmptyState from "@/shared/ui/EmptyState";
import ImagePlaceholder from "@/shared/ui/ImagePlaceholder";
import PaginationControls from "@/shared/ui/PaginationControls";

export default function ProductsPage() {
  const {
    products,
    categorias,
    filteredSubcategorias,
    loading,
    error,
    hasProducts,
    hasActiveFilters,
    filtersForm,
    page,
    pageSize,
    totalPages,
    totalItemsCount,
    totalItems,
    activeImageByProduct,
    updateFilterField,
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
          <h1 className="app-title text-2xl">Productos</h1>
          <p className="app-subtitle text-sm">Explorá el catálogo y agregá al carrito.</p>
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
            <h2 className="app-title text-lg">Filtros</h2>

            <div className="mt-4 space-y-3">
              <div>
                <label className="mb-1 block text-sm text-dark-gray">Nombre</label>
                <input
                  className="app-input"
                  value={filtersForm.nombre}
                  onChange={(event) => updateFilterField("nombre", event.target.value)}
                  placeholder="Buscar por nombre"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm text-dark-gray">Categoría</label>
                <select
                  className="app-input"
                  value={filtersForm.id_categoria}
                  onChange={(event) => updateFilterField("id_categoria", event.target.value)}
                >
                  <option value="">Todas</option>
                  {categorias.map((categoria) => (
                    <option key={categoria.id} value={categoria.id}>
                      {categoria.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm text-dark-gray">Subcategoría</label>
                <select
                  className="app-input"
                  value={filtersForm.id_subcategoria}
                  onChange={(event) => updateFilterField("id_subcategoria", event.target.value)}
                >
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
                    value={filtersForm.precio_min}
                    onChange={(event) => updateFilterField("precio_min", event.target.value)}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-dark-gray">Precio max</label>
                  <input
                    type="number"
                    step="0.01"
                    className="app-input"
                    value={filtersForm.precio_max}
                    onChange={(event) => updateFilterField("precio_max", event.target.value)}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <button type="button" className="app-btn-primary" onClick={applyFilters}>
                  Filtrar
                </button>
                <button type="button" className="app-btn-secondary" onClick={clearFilters}>
                  Limpiar
                </button>
              </div>
            </div>
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

