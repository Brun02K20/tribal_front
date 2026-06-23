"use client";

import Link from "next/link";
import { useProductsCatalog } from "@/features/products/hooks/useProductsCatalog";
import { toNumber } from "@/shared/lib/formatters";
import LoadingState from "@/shared/ui/LoadingState";
import ErrorState from "@/shared/ui/ErrorState";
import EmptyState from "@/shared/ui/EmptyState";
import ImagePlaceholder from "@/shared/ui/ImagePlaceholder";
import PaginationControls from "@/shared/ui/PaginationControls";
import AppModal from "@/shared/ui/AppModal";
import ProductDesignSelector from "@/features/products/components/ProductDesignSelector";
import type { ProductDiseno } from "@/types/products";

type ProductDisenoWithPhoto = ProductDiseno & { url_foto: string };

const hasDesignPhoto = (diseno: ProductDiseno): diseno is ProductDisenoWithPhoto => Boolean(diseno.url_foto);

export default function ProductsPageClient() {
  const {
    products,
    categorias,
    filteredSubcategorias,
    selectedCategoriaId,
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
    designProduct,
    designQuantity,
    selectedDesignUrls,
    applyFilters,
    clearFilters,
    goToPage,
    addProductToCart,
    closeDesignModal,
    updateDesignQuantity,
    toggleDesignUrl,
    updateDesignUrlQuantity,
    confirmDesignProduct,
    goToCheckout,
  } = useProductsCatalog();

  return (
    <main className="app-page">
      <div className="app-container mx-auto max-w-360">
      <header className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="app-title text-2xl">Accesorios Artesanales, lo mas unico, diferente, exclusivo y original para vos.</h1>
          <p className="app-subtitle text-sm">¿Lista para destacar de entre la multitud? Cada pieza de Tribal Trend es una obra de arte única para llevar puesta, elaborada a mano con piedras naturales, resina y un intrincado entramado de alambre para reflejar tu individualidad. Encuentra la pieza perfecta que realce todo tu estilo. ¡Explora nuestra colección!</p>
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
                <select className="app-input disabled:cursor-not-allowed disabled:opacity-50" disabled={!selectedCategoriaId} {...registerFilters("id_subcategoria")}>
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
                    const productDesignsWithPhoto = (product.disenos ?? []).filter(hasDesignPhoto);
                    const activeDesign = !product.es_unico && productDesignsWithPhoto.length
                      ? productDesignsWithPhoto[activeImageByProduct[product.id] ?? 0] ?? productDesignsWithPhoto[0]
                      : null;
                    const activeImageUrl = activeDesign?.url_foto ?? product.fotos[activeImageByProduct[product.id] ?? 0]?.url;
                    const hasDiscount =
                      !activeDesign
                      &&
                      typeof product.descuento_aplicado?.porcentaje === "number"
                      && Number(product.descuento_aplicado.porcentaje) > 0;
                    const precioFinal = activeDesign
                      ? toNumber(activeDesign.precio)
                      : hasDiscount ? toNumber(product.precio_final ?? precio) : precio;
                    const discountPercentage = hasDiscount ? Number(product.descuento_aplicado?.porcentaje ?? 0) : 0;

                    return (
                      <article key={product.id} className="app-panel">
                        {activeImageUrl ? (
                          <div className="relative mb-3">
                            {hasDiscount && (
                              <span className="absolute left-2 top-2 z-10 rounded-full bg-earth-brown px-2 py-1 text-xs font-semibold text-cream">
                                {discountPercentage}% OFF
                              </span>
                            )}
                            <img
                              key={`${product.id}-${activeImageByProduct[product.id] ?? 0}`}
                              src={activeImageUrl}
                              alt={`${activeDesign?.nombre ?? product.nombre} artesanal - Tribal Trend`}
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
                        {activeDesign && <p className="mt-1 text-sm font-semibold text-earth-brown">Diseño: {activeDesign.nombre}</p>}
                        <p className="mt-1 text-sm text-zinc-600">
                          {product.categoria?.nombre ?? "-"} / {product.subcategoria?.nombre ?? "-"}
                        </p>
                        {hasDiscount ? (
                          <div className="mt-2">
                            <p className="text-sm text-zinc-500 line-through">${precio.toFixed(2)}</p>
                            <p className="text-lg font-bold text-earth-brown">${precioFinal.toFixed(2)}</p>
                          </div>
                        ) : (
                          <p className="mt-2 text-lg font-bold">${precioFinal.toFixed(2)}</p>
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
      {designProduct && (
        <AppModal>
          <div className="app-modal-backdrop">
            <div className="app-modal-card max-w-xl p-4 sm:p-5">
              <h3 className="app-title text-xl">{designProduct.nombre}</h3>
              <div className="mt-4">
                <ProductDesignSelector
                  fotos={designProduct.fotos ?? []}
                  disenos={designProduct.disenos ?? []}
                  quantity={designQuantity}
                  maxQuantity={toNumber(designProduct.stock)}
                  selectedUrls={selectedDesignUrls}
                  onQuantityChange={updateDesignQuantity}
                  onToggleUrl={toggleDesignUrl}
                  onDesignQuantityChange={updateDesignUrlQuantity}
                />
              </div>
              <div className="mt-5 flex justify-end gap-2">
                <button type="button" className="app-btn-secondary" onClick={closeDesignModal}>
                  Cancelar
                </button>
                <button
                  type="button"
                  className="app-btn-primary disabled:cursor-not-allowed disabled:opacity-60"
                  onClick={confirmDesignProduct}
                  disabled={selectedDesignUrls.length === 0 || selectedDesignUrls.length !== designQuantity}
                >
                  Agregar al carrito
                </button>
              </div>
            </div>
          </div>
        </AppModal>
      )}
      </div>
    </main>
  );
}
