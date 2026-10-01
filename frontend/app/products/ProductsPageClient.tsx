"use client";

import Link from "next/link";
import { useState } from "react";
import { useProductsCatalog } from "@/features/products/hooks/useProductsCatalog";
import { formatPrice, toNumber } from "@/shared/lib/formatters";
import ErrorState from "@/shared/ui/ErrorState";
import AppModal from "@/shared/ui/AppModal";
import TrustIcon from "@/shared/ui/TrustIcon";
import ProductPhoto from "@/shared/ui/ProductPhoto";
import ProductDesignSelector from "@/features/products/components/ProductDesignSelector";
import ProductCard, { ProductCardSkeleton } from "@/features/products/components/ProductCard";
import HeroCollage from "@/features/products/components/HeroCollage";
import { getDesignsWithPhoto, getProductImages, getProductPricing } from "@/features/products/lib/presentation";
import { useAuth } from "@/shared/providers/AuthContext";
import { getEncargosHref, INSTAGRAM_HANDLE, INSTAGRAM_URL, TRUST_POINTS } from "@/shared/lib/brand";
import { IconArrowLeft, IconArrowRight, IconClose, IconInstagram, IconSearch, IconSliders, IconSparkle } from "@/shared/ui/Icons";

const capitalize = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

// Posición del bloque de encargos dentro de la grilla (después de la 6ª pieza).
const IN_GRID_PROMO_INDEX = 6;

export default function ProductsPageClient() {
  const {
    products,
    featuredProducts,
    categorias,
    filteredSubcategorias,
    activeCategoriaId,
    activeSubcategoriaId,
    loading,
    error,
    hasProducts,
    hasActiveFilters,
    registerFilters,
    page,
    totalPages,
    totalItemsCount,
    designProduct,
    designQuantity,
    selectedDesignUrls,
    applyFilters,
    clearFilters,
    selectCategoria,
    selectSubcategoria,
    goToPage,
    addProductToCart,
    closeDesignModal,
    updateDesignQuantity,
    toggleDesignUrl,
    updateDesignUrlQuantity,
    confirmDesignProduct,
  } = useProductsCatalog();
  const { isAuthenticated } = useAuth();
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const encargosHref = getEncargosHref(isAuthenticated);

  const changePage = (nextPage: number) => {
    goToPage(nextPage);
    document.getElementById("coleccion")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const designSelectionTotal = designProduct
    ? selectedDesignUrls.reduce((acc, url) => {
        const diseno = getDesignsWithPhoto(designProduct).find((item) => item.url_foto === url);
        return acc + toNumber(diseno?.precio ?? 0);
      }, 0)
    : 0;
  const instagramProducts = featuredProducts.filter((product) => getProductImages(product).length > 0).slice(3, 9);
  const campaignProducts = featuredProducts.filter((product) => getProductImages(product).length > 0).slice(3, 5);

  return (
    <main>
      {/* HERO */}
      <section className="relative">
        <div className="mx-auto grid w-full max-w-360 items-center gap-5 px-4 pb-10 pt-4 md:grid-cols-[1fr_1.05fr] md:gap-12 md:px-6 md:pb-16 md:pt-12">
          <div className="app-reveal order-2 md:order-1">
            <p className="app-kicker">Joyería artesanal · Hecha a mano en Argentina</p>
            <h1 className="app-display mt-3 text-[2.25rem] sm:text-5xl lg:text-6xl">
              Joyas únicas, <span className="text-terracotta">hechas a mano</span> para vos
            </h1>
            <p className="mt-3 max-w-md text-base text-dark-gray md:mt-4 md:text-lg">
              Collares, pulseras, anillos y aros con piedras naturales. Cada pieza es irrepetible: cuando se va, no vuelve.
            </p>
            <div className="mt-5 flex flex-wrap gap-3 md:mt-7">
              <a href="#coleccion" className="app-btn-cta text-base">
                Comprar ahora <IconArrowRight className="h-4 w-4" />
              </a>
              <Link href={encargosHref} className="app-btn-outline text-base">
                Encargá tu diseño
              </Link>
            </div>
            <ul className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-sm text-dark-gray">
              {TRUST_POINTS.slice(0, 3).map((point) => (
                <li key={point.key} className="flex items-center gap-2">
                  <TrustIcon name={point.key} className="h-4 w-4 text-earth-brown" />
                  {point.title}
                </li>
              ))}
            </ul>
          </div>
          <div className="order-1 md:order-2">
            <HeroCollage products={featuredProducts} />
          </div>
        </div>
      </section>

      {/* COLECCIÓN */}
      <section id="coleccion" className="mx-auto w-full max-w-360 scroll-mt-20 px-4 md:scroll-mt-24 md:px-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="app-kicker">La colección</p>
            <h2 className="app-display mt-1 text-3xl md:text-4xl">Elegí la tuya</h2>
          </div>
          {!loading && !error && (
            <p className="text-sm text-dark-gray">
              {totalItemsCount} {totalItemsCount === 1 ? "pieza" : "piezas"}
              {hasActiveFilters ? " encontradas" : " disponibles"}
            </p>
          )}
        </div>

        <div className="mt-5 flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="app-scroll-x -mx-4 flex flex-1 gap-2 px-4 pb-1 lg:mx-0 lg:px-0" role="group" aria-label="Categorías">
            <button type="button" className="app-chip" data-active={!activeCategoriaId} onClick={() => selectCategoria(null)}>
              Todo
            </button>
            {categorias.map((categoria) => (
              <button
                key={categoria.id}
                type="button"
                className="app-chip"
                data-active={activeCategoriaId === categoria.id}
                onClick={() => selectCategoria(categoria.id)}
              >
                {capitalize(categoria.nombre)}
              </button>
            ))}
          </div>

          <form className="flex items-center gap-2" onSubmit={applyFilters} role="search">
            <label className="relative flex-1 lg:w-64">
              <span className="sr-only">Buscar piezas</span>
              <IconSearch className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-earth-brown" />
              <input
                type="search"
                className="app-input rounded-full! py-2.5! pl-10!"
                placeholder="Buscar piezas…"
                {...registerFilters("nombre")}
              />
            </label>
            <button
              type="button"
              className="app-chip"
              data-active={isFiltersOpen}
              onClick={() => setIsFiltersOpen((prev) => !prev)}
              aria-expanded={isFiltersOpen}
              aria-controls="filtros-precio"
            >
              <IconSliders className="h-4 w-4" /> Precio
            </button>
          </form>
        </div>

        {activeCategoriaId && filteredSubcategorias.length > 0 && (
          <div className="app-scroll-x -mx-4 mt-3 flex gap-2 px-4 lg:mx-0 lg:px-0" role="group" aria-label="Subcategorías">
            <button
              type="button"
              className="app-chip"
              data-active={!activeSubcategoriaId}
              onClick={() => selectSubcategoria(null)}
            >
              Todas
            </button>
            {filteredSubcategorias.map((subcategoria) => (
              <button
                key={subcategoria.id}
                type="button"
                className="app-chip"
                data-active={activeSubcategoriaId === subcategoria.id}
                onClick={() => selectSubcategoria(subcategoria.id)}
              >
                {capitalize(subcategoria.nombre)}
              </button>
            ))}
          </div>
        )}

        <form
          id="filtros-precio"
          className="app-collapsible mt-3 rounded-2xl border border-line bg-white/80"
          data-open={isFiltersOpen}
          aria-hidden={!isFiltersOpen}
          onSubmit={applyFilters}
        >
          <div className="flex flex-wrap items-end gap-3 p-4">
            <label className="w-32 text-xs text-dark-gray">
              Desde ($)
              <input type="number" min={0} step="100" className="app-input mt-1" {...registerFilters("precio_min")} />
            </label>
            <label className="w-32 text-xs text-dark-gray">
              Hasta ($)
              <input type="number" min={0} step="100" className="app-input mt-1" {...registerFilters("precio_max")} />
            </label>
            <button type="submit" className="app-btn-primary">
              Aplicar
            </button>
          </div>
        </form>

        {hasActiveFilters && (
          <button
            type="button"
            className="mt-3 inline-flex items-center gap-1.5 text-sm text-earth-brown underline-offset-4 hover:underline"
            onClick={clearFilters}
          >
            <IconClose className="h-4 w-4" /> Limpiar filtros
          </button>
        )}

        {error && <ErrorState message={error} className="mt-6 text-sm text-red-600" />}

        {loading ? (
          <div className="mt-6 grid grid-cols-2 gap-x-3 gap-y-7 sm:gap-x-5 md:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <ProductCardSkeleton key={`skeleton-${index}`} />
            ))}
          </div>
        ) : !error && !hasProducts ? (
          <div className="mt-8 flex flex-col items-center gap-4 rounded-3xl border border-dashed border-earth-brown/40 bg-white/60 px-6 py-12 text-center">
            <p className="app-display text-2xl">
              {hasActiveFilters ? "No encontramos piezas con esos filtros" : "Estamos creando nuevas piezas"}
            </p>
            <p className="max-w-md text-sm text-dark-gray">
              Probá con otra categoría o contanos qué buscás: podemos hacerla a medida.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {hasActiveFilters && (
                <button type="button" className="app-btn-outline" onClick={clearFilters}>
                  Ver toda la colección
                </button>
              )}
              <Link href={encargosHref} className="app-btn-cta">
                Encargar mi pieza
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="mt-6 grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 md:grid-cols-3 xl:grid-cols-4">
              {products.map((product, index) => (
                <div key={product.id} className="contents">
                  {index === IN_GRID_PROMO_INDEX && page === 1 && !hasActiveFilters && (
                    <Link
                      href={encargosHref}
                      className="app-campaign group flex aspect-4/5 flex-col justify-end p-4 sm:p-6"
                    >
                      <IconSparkle className="mb-auto h-8 w-8 text-mustard" />
                      <p className="app-kicker">A medida</p>
                      <p className="app-display mt-1 text-xl sm:text-3xl">¿No encontraste la tuya?</p>
                      <p className="mt-2 hidden text-sm text-cream/80 sm:block">La diseñamos con tus piedras y colores favoritos.</p>
                      <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-mustard">
                        Encargar ahora <IconArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                      </span>
                    </Link>
                  )}
                  <ProductCard product={product} onQuickAdd={addProductToCart} priority={index < 4} />
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <nav className="mt-10 flex items-center justify-center gap-3" aria-label="Paginación de productos">
                <button
                  type="button"
                  className="app-btn-outline"
                  onClick={() => changePage(page - 1)}
                  disabled={page <= 1}
                  aria-label="Página anterior"
                >
                  <IconArrowLeft className="h-4 w-4" />
                  <span className="hidden sm:inline">Anterior</span>
                </button>
                <span className="text-sm text-dark-gray">
                  Página <strong className="text-black">{page}</strong> de {totalPages}
                </span>
                <button
                  type="button"
                  className="app-btn-cta"
                  onClick={() => changePage(page + 1)}
                  disabled={page >= totalPages}
                  aria-label="Página siguiente"
                >
                  <span className="hidden sm:inline">Ver más piezas</span>
                  <span className="sm:hidden">Más</span>
                  <IconArrowRight className="h-4 w-4" />
                </button>
              </nav>
            )}
          </>
        )}
      </section>

      {/* CAMPAÑA ENCARGOS */}
      <section className="mx-auto mt-20 w-full max-w-360 px-4 md:px-6">
        <div className="app-campaign grid items-center gap-8 p-7 sm:p-10 md:grid-cols-[1.3fr_1fr] md:p-14">
          <div className="relative z-10">
            <p className="app-kicker">Encargos personalizados</p>
            <h2 className="app-display mt-2 text-3xl sm:text-4xl md:text-5xl">Tu idea, convertida en una joya</h2>
            <p className="mt-4 max-w-lg text-cream/85">
              Elegís la piedra, los colores y el estilo. La creamos a mano, solo para vos.
            </p>
            <Link href={encargosHref} className="app-btn-cta mt-7 text-base">
              Encargar mi pieza <IconArrowRight className="h-4 w-4" />
            </Link>
          </div>
          {campaignProducts.length === 2 && (
            <div className="relative z-10 mx-auto flex h-56 w-full max-w-sm items-center justify-center sm:h-64" aria-hidden="true">
              <div className="app-round-frame absolute left-0 top-0 h-40 w-40 sm:h-48 sm:w-48">
                <ProductPhoto src={getProductImages(campaignProducts[0])[0]} alt="" />
              </div>
              <div className="app-arch absolute bottom-0 right-2 h-48 w-36 sm:h-56 sm:w-40">
                <ProductPhoto src={getProductImages(campaignProducts[1])[0]} alt="" />
              </div>
            </div>
          )}
        </div>
      </section>

      {/* INSTAGRAM */}
      <section className="mx-auto mt-20 w-full max-w-360 px-4 text-center md:px-6">
        <p className="app-kicker">Comunidad Tribal</p>
        <h2 className="app-display mt-2 text-3xl md:text-4xl">Las piezas nuevas salen primero en Instagram</h2>
        <p className="mx-auto mt-3 max-w-lg text-dark-gray">
          Seguinos en {INSTAGRAM_HANDLE} para enterarte antes que nadie. Las piezas únicas vuelan.
        </p>
        {instagramProducts.length > 0 && (
          <div className="mt-8 grid grid-cols-3 gap-2 sm:gap-3 md:grid-cols-6">
            {instagramProducts.map((product) => (
              <Link
                key={product.id}
                href={`/products/${product.id}`}
                className="group relative aspect-square overflow-hidden rounded-2xl bg-sand"
                aria-label={`Ver ${product.nombre}`}
              >
                <ProductPhoto src={getProductImages(product)[0]} alt={`${product.nombre} artesanal`} />
                <span className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/70 to-transparent p-2 text-left text-xs font-semibold text-cream opacity-0 transition group-hover:opacity-100">
                  {formatPrice(getProductPricing(product).price)}
                </span>
              </Link>
            ))}
          </div>
        )}
        <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="app-btn-outline mt-8">
          <IconInstagram className="h-5 w-5" /> Seguir a {INSTAGRAM_HANDLE}
        </a>
      </section>

      {designProduct && (
        <AppModal>
          <div className="app-modal-backdrop" onClick={(event) => event.target === event.currentTarget && closeDesignModal()}>
            <div className="app-modal-card max-w-xl p-5 sm:p-6" role="dialog" aria-modal="true" aria-labelledby="design-modal-title">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="app-kicker">Elegí tu diseño</p>
                  <h3 id="design-modal-title" className="app-display mt-1 text-2xl first-letter:uppercase">{designProduct.nombre}</h3>
                </div>
                <button type="button" className="app-icon-btn" onClick={closeDesignModal} aria-label="Cerrar">
                  <IconClose />
                </button>
              </div>
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
              <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                <Link href={`/products/${designProduct.id}`} className="text-center text-sm text-earth-brown underline-offset-4 hover:underline">
                  Ver todos los detalles
                </Link>
                <button
                  type="button"
                  className="app-btn-cta"
                  onClick={confirmDesignProduct}
                  disabled={selectedDesignUrls.length === 0 || selectedDesignUrls.length !== designQuantity}
                >
                  {selectedDesignUrls.length === 0
                    ? "Elegí al menos un diseño"
                    : `Agregar al carrito · ${formatPrice(designSelectionTotal)}`}
                </button>
              </div>
            </div>
          </div>
        </AppModal>
      )}
    </main>
  );
}
