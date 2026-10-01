"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useProductDetail } from "@/features/products/hooks/useProductDetail";
import { useProductResenas } from "@/features/products/hooks/useProductResenas";
import { useRelatedProducts } from "@/features/products/hooks/useRelatedProducts";
import ProductResenasSection, { RatingSummary } from "@/features/products/components/ProductResenasSection";
import ProductDesignSelector from "@/features/products/components/ProductDesignSelector";
import ProductCard from "@/features/products/components/ProductCard";
import {
  getDesignsWithPhoto,
  getProductImages,
  getProductPricing,
  isMultiDesign,
  LOW_STOCK_THRESHOLD,
} from "@/features/products/lib/presentation";
import { toSimpleCartItem } from "@/features/products/lib/cart";
import { formatPrice, toNumber } from "@/shared/lib/formatters";
import { useCart } from "@/shared/providers/CartContext";
import { useAuth } from "@/shared/providers/AuthContext";
import { getEncargosHref, OPEN_CHAT_EVENT } from "@/shared/lib/brand";
import ErrorState from "@/shared/ui/ErrorState";
import ProductPhoto from "@/shared/ui/ProductPhoto";
import type { Product } from "@/types/products";
import {
  IconArrowLeft,
  IconArrowRight,
  IconBagPlus,
  IconChat,
  IconLock,
  IconMinus,
  IconPlus,
  IconTruck,
} from "@/shared/ui/Icons";

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
    activeImageIndex,
    selectedDesignUrls,
    canAddToCart,
    setActiveImageIndex,
    updateQuantity,
    toggleDesignUrl,
    updateDesignUrlQuantity,
    addCurrentProductToCart,
    buyNow,
  } = useProductDetail(productId);
  const resenas = useProductResenas(productId);
  const related = useRelatedProducts(product);
  const { addItem, openCart } = useCart();
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [isZoomActive, setIsZoomActive] = useState(false);
  const [zoomOrigin, setZoomOrigin] = useState({ x: 50, y: 50 });
  const [showStickyBar, setShowStickyBar] = useState(false);
  const ctaRef = useRef<HTMLDivElement | null>(null);
  const selectorRef = useRef<HTMLDivElement | null>(null);

  // Barra fija de compra (mobile) cuando los botones principales quedan arriba, fuera de pantalla.
  useEffect(() => {
    if (!product || loading) {
      return;
    }

    const mobileQuery = window.matchMedia("(max-width: 1023px)");
    const update = () => {
      const target = ctaRef.current;
      const visible = Boolean(target) && target!.getBoundingClientRect().bottom < 0;
      setShowStickyBar(visible);
      document.body.dataset.stickyBuy = String(visible && mobileQuery.matches);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);

    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      delete document.body.dataset.stickyBuy;
    };
  }, [product, loading]);

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

  const quickAddRelated = (item: Product) => {
    if (isMultiDesign(item)) {
      router.push(`/products/${item.id}`);
      return;
    }
    addItem(toSimpleCartItem(item));
    openCart();
  };

  if (loading) {
    return (
      <main className="mx-auto w-full max-w-360 px-4 pt-6 md:px-6 md:pt-10" aria-busy="true">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,660px)_minmax(340px,1fr)] lg:gap-12">
          <div className="app-skeleton aspect-4/5 rounded-[1.75rem]" />
          <div className="space-y-4">
            <div className="app-skeleton h-10 w-3/4 rounded-full" />
            <div className="app-skeleton h-8 w-1/3 rounded-full" />
            <div className="app-skeleton h-14 w-full rounded-full" />
            <div className="app-skeleton h-14 w-full rounded-full" />
          </div>
        </div>
      </main>
    );
  }

  if (error || !product) {
    return (
      <main className="mx-auto flex w-full max-w-360 flex-col items-center gap-4 px-4 py-16 text-center">
        <ErrorState message={error ?? "No encontramos esta pieza."} className="text-red-700" />
        <Link href="/products" className="app-btn-cta">
          Ver la colección
        </Link>
      </main>
    );
  }

  const galleryImages = getProductImages(product);
  const activeIndex = Math.min(activeImageIndex, Math.max(galleryImages.length - 1, 0));
  const activeImage = galleryImages[activeIndex];
  const multiDesign = isMultiDesign(product);
  const pricing = getProductPricing(product);
  const isSoldOut = stock <= 0;
  const designPriceByUrl = new Map(getDesignsWithPhoto(product).map((diseno) => [diseno.url_foto, toNumber(diseno.precio)]));
  const selectionTotal = selectedDesignUrls.reduce((acc, url) => acc + (designPriceByUrl.get(url) ?? 0), 0);
  const displayTotal = multiDesign && selectedDesignUrls.length ? selectionTotal : pricing.price * (multiDesign ? 1 : quantity);
  const needsDesign = multiDesign && selectedDesignUrls.length === 0;
  const encargosHref = getEncargosHref(isAuthenticated);
  const measures = [product.ancho, product.alto, product.profundo].map(toNumber);
  const hasMeasures = measures.every((value) => Number.isFinite(value) && value > 0);

  const goToImage = (index: number) => {
    if (!galleryImages.length) {
      return;
    }
    setActiveImageIndex((index + galleryImages.length) % galleryImages.length);
  };

  const previewDesign = (url: string) => {
    const index = galleryImages.indexOf(url);
    if (index >= 0) {
      setActiveImageIndex(index);
    }
  };

  const scrollToSelector = () => selectorRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });

  const stockMessage = isSoldOut
    ? null
    : stock === 1
      ? "¡Última unidad disponible!"
      : stock <= LOW_STOCK_THRESHOLD
        ? `¡Quedan solo ${stock} unidades!`
        : "Disponible";

  return (
    <main className="mx-auto w-full max-w-360 px-4 pt-4 md:px-6 md:pt-8">
      <nav className="mb-4 flex items-center gap-2 text-sm text-dark-gray" aria-label="Migas de pan">
        <Link href="/products" className="inline-flex items-center gap-1.5 hover:text-earth-brown">
          <IconArrowLeft className="h-4 w-4" /> Tienda
        </Link>
        {product.subcategoria?.nombre && (
          <>
            <span aria-hidden="true">/</span>
            <span className="truncate first-letter:uppercase">{product.subcategoria.nombre}</span>
          </>
        )}
      </nav>

      <section className="grid gap-8 lg:grid-cols-[minmax(0,660px)_minmax(340px,1fr)] lg:gap-12">
        {/* GALERÍA */}
        <div className="flex flex-col-reverse gap-3 lg:sticky lg:top-28 lg:flex-row lg:self-start">
          {galleryImages.length > 1 && (
            <div className="app-scroll-x flex gap-2 lg:max-h-[calc(100vh-9rem)] lg:flex-col lg:overflow-y-auto" role="tablist" aria-label="Fotos">
              {galleryImages.map((url, index) => (
                <button
                  key={url}
                  type="button"
                  role="tab"
                  aria-selected={index === activeIndex}
                  onMouseEnter={() => setActiveImageIndex(index)}
                  onClick={() => setActiveImageIndex(index)}
                  className={`h-20 w-16 shrink-0 overflow-hidden rounded-xl border-2 bg-sand transition lg:h-24 lg:w-20 ${
                    index === activeIndex ? "border-terracotta" : "border-transparent opacity-75 hover:opacity-100"
                  }`}
                  aria-label={`Ver foto ${index + 1}`}
                >
                  <img src={url} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}

          <div className="relative w-full lg:max-w-[560px]">
            <div
              className="relative aspect-4/5 w-full overflow-hidden rounded-[1.75rem] bg-sand shadow-[0_24px_48px_rgba(47,47,47,0.16)]"
              onMouseMove={updateZoomOrigin}
              onMouseEnter={() => setIsZoomActive(true)}
              onMouseLeave={() => setIsZoomActive(false)}
            >
              {activeImage ? (
                <ProductPhoto
                  key={activeImage}
                  src={activeImage}
                  alt={`${product.nombre} artesanal - foto ${activeIndex + 1}`}
                  loading="eager"
                  fetchPriority="high"
                  className="app-fade-swap app-photo-mat"
                  maxUpscale={1.5}
                  imgStyle={{
                    transformOrigin: `${zoomOrigin.x}% ${zoomOrigin.y}%`,
                    // Zoom moderado: las fotos originales son chicas y con más aumento se pixelan.
                    transform: isZoomActive ? "scale(1.5)" : "scale(1)",
                    transition: "transform 200ms ease",
                    cursor: isZoomActive ? "zoom-out" : "zoom-in",
                  }}
                />
              ) : (
                <span className="absolute inset-0 grid place-items-center text-dark-gray">Foto próximamente</span>
              )}

              <div className="app-product-badges">
                {pricing.discountPercentage > 0 && (
                  <span className="app-badge app-badge-sale">-{pricing.discountPercentage}%</span>
                )}
                {product.es_unico && !isSoldOut && <span className="app-badge app-badge-unique">Pieza única</span>}
              </div>
            </div>

            {galleryImages.length > 1 && (
              <>
                <button
                  type="button"
                  className="absolute left-3 top-1/2 z-10 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-cream/90 text-earth-brown shadow-lg hover:bg-cream"
                  onClick={() => goToImage(activeIndex - 1)}
                  aria-label="Foto anterior"
                >
                  <IconArrowLeft className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  className="absolute right-3 top-1/2 z-10 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-cream/90 text-earth-brown shadow-lg hover:bg-cream"
                  onClick={() => goToImage(activeIndex + 1)}
                  aria-label="Foto siguiente"
                >
                  <IconArrowRight className="h-5 w-5" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* COMPRA */}
        <div className="lg:sticky lg:top-28 lg:self-start">
          <p className="app-kicker">{product.es_unico ? "Pieza única · Hecha a mano" : "Hecha a mano · Varios diseños"}</p>
          <h1 className="app-display mt-2 text-4xl first-letter:uppercase md:text-5xl">{product.nombre}</h1>
          <div className="mt-3">
            <RatingSummary resenas={resenas} />
          </div>

          <div className="mt-5 flex flex-wrap items-baseline gap-x-3 gap-y-1">
            {needsDesign && pricing.isFromPrice && <span className="text-sm text-dark-gray">Desde</span>}
            <span className={`text-4xl font-bold ${pricing.originalPrice ? "text-terracotta" : "text-black"}`}>
              {formatPrice(displayTotal)}
            </span>
            {pricing.originalPrice && (
              <>
                <span className="text-lg text-dark-gray/70 line-through">{formatPrice(pricing.originalPrice)}</span>
                <span className="app-badge app-badge-sale">
                  Ahorrás {formatPrice(pricing.originalPrice - pricing.price)}
                </span>
              </>
            )}
          </div>
          {multiDesign && selectedDesignUrls.length > 1 && (
            <p className="mt-1 text-sm text-dark-gray">Total por {selectedDesignUrls.length} diseños elegidos</p>
          )}

          {stockMessage && (
            <p className={`mt-3 flex items-center gap-2 text-sm font-semibold ${stock <= LOW_STOCK_THRESHOLD ? "text-terracotta" : "text-sage"}`}>
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full rounded-full bg-current opacity-60 motion-safe:animate-ping" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-current" />
              </span>
              {stockMessage}
            </p>
          )}

          {multiDesign && !isSoldOut && (
            <div ref={selectorRef} className="mt-6 rounded-3xl border border-line bg-white/70 p-4">
              <ProductDesignSelector
                fotos={product.fotos ?? []}
                disenos={product.disenos ?? []}
                quantity={quantity}
                maxQuantity={stock}
                selectedUrls={selectedDesignUrls}
                onQuantityChange={updateQuantity}
                onToggleUrl={toggleDesignUrl}
                onDesignQuantityChange={updateDesignUrlQuantity}
                onPreview={previewDesign}
              />
            </div>
          )}

          {!multiDesign && !isSoldOut && stock > 1 && (
            <div className="mt-6 flex items-center gap-3">
              <span className="text-sm text-dark-gray">Cantidad</span>
              <div className="app-stepper">
                <button type="button" onClick={() => updateQuantity(quantity - 1)} disabled={quantity <= 1} aria-label="Restar una unidad">
                  <IconMinus className="h-4 w-4" />
                </button>
                <span>{quantity}</span>
                <button type="button" onClick={() => updateQuantity(quantity + 1)} disabled={quantity >= stock} aria-label="Sumar una unidad">
                  <IconPlus className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          <div ref={ctaRef} className="mt-6 grid gap-3">
            {isSoldOut ? (
              <>
                <p className="rounded-2xl border border-line bg-white/70 p-4 text-sm text-dark-gray">
                  Esta pieza ya encontró su hogar. ¿Te gustó? Podemos hacerte una parecida a pedido.
                </p>
                <Link href={encargosHref} className="app-btn-cta w-full text-base">
                  Encargar una similar <IconArrowRight className="h-4 w-4" />
                </Link>
              </>
            ) : (
              <>
                <button type="button" className="app-btn-cta w-full py-4! text-base" onClick={needsDesign ? scrollToSelector : buyNow} disabled={!needsDesign && !canAddToCart}>
                  {needsDesign ? "Elegí tu diseño para comprar" : "Comprar ahora"}
                  {!needsDesign && <IconArrowRight className="h-4 w-4" />}
                </button>
                <button
                  type="button"
                  className="app-btn-outline w-full text-base"
                  onClick={addCurrentProductToCart}
                  disabled={!canAddToCart}
                >
                  <IconBagPlus className="h-5 w-5" /> Agregar al carrito
                </button>
              </>
            )}
          </div>

          <ul className="mt-6 grid gap-3 rounded-3xl border border-line bg-white/60 p-4 text-sm">
            <li className="flex items-start gap-3">
              <IconTruck className="mt-0.5 h-5 w-5 shrink-0 text-earth-brown" />
              <span><strong>Envíos a todo el país</strong> con Correo Argentino, a domicilio o sucursal.</span>
            </li>
            <li className="flex items-start gap-3">
              <IconLock className="mt-0.5 h-5 w-5 shrink-0 text-earth-brown" />
              <span><strong>Pago 100% seguro</strong> con Mercado Pago.</span>
            </li>
            <li className="flex items-start gap-3">
              <IconChat className="mt-0.5 h-5 w-5 shrink-0 text-earth-brown" />
              <span>
                ¿Dudas con esta pieza?{" "}
                <button
                  type="button"
                  className="font-semibold text-earth-brown underline underline-offset-4"
                  onClick={() => window.dispatchEvent(new Event(OPEN_CHAT_EVENT))}
                >
                  Escribinos por el chat
                </button>
              </span>
            </li>
          </ul>

          <div className="mt-6 divide-y divide-line border-y border-line">
            {product.descripcion?.trim() && (
              <details className="app-details group py-4">
                <summary className="flex items-center justify-between font-semibold">
                  Sobre esta pieza
                  <IconPlus className="app-details-icon h-4 w-4 text-earth-brown" />
                </summary>
                <p className="mt-3 whitespace-pre-line text-sm leading-6 text-dark-gray">{product.descripcion}</p>
              </details>
            )}
            {hasMeasures && (
              <details className="app-details py-4">
                <summary className="flex items-center justify-between font-semibold">
                  Medidas
                  <IconPlus className="app-details-icon h-4 w-4 text-earth-brown" />
                </summary>
                <p className="mt-3 text-sm text-dark-gray">
                  {measures[0]} × {measures[1]} × {measures[2]} cm (ancho × alto × profundidad)
                </p>
              </details>
            )}
            <details className="app-details py-4">
              <summary className="flex items-center justify-between font-semibold">
                Envíos y pagos
                <IconPlus className="app-details-icon h-4 w-4 text-earth-brown" />
              </summary>
              <p className="mt-3 text-sm leading-6 text-dark-gray">
                Calculamos el envío en el checkout con tu código postal y podés elegir entre recibirlo en tu casa o
                retirarlo en una sucursal de Correo Argentino. El pago se hace con Mercado Pago.
              </p>
            </details>
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="mt-16" aria-labelledby="relacionados-title">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="app-kicker">Completá tu look</p>
              <h2 id="relacionados-title" className="app-display mt-1 text-3xl">También te puede gustar</h2>
            </div>
            <Link href="/products" className="hidden items-center gap-1.5 text-sm font-semibold text-earth-brown sm:inline-flex">
              Ver toda la colección <IconArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="app-scroll-x -mx-4 mt-6 flex snap-x gap-4 px-4 pb-2 md:mx-0 md:grid md:grid-cols-4 md:px-0 md:[mask-image:none]!">
            {related.map((item) => (
              <div key={item.id} className="w-[44vw] shrink-0 snap-start sm:w-[30vw] md:w-auto">
                <ProductCard product={item} onQuickAdd={quickAddRelated} />
              </div>
            ))}
          </div>
        </section>
      )}

      <ProductResenasSection resenas={resenas} />

      {!isSoldOut && (
        <div className="app-sticky-buy lg:hidden" data-visible={showStickyBar} aria-hidden={!showStickyBar} inert={!showStickyBar}>
          <div className="mx-auto flex max-w-360 items-center gap-3 px-4 py-3">
            {activeImage && <img src={galleryImages[0]} alt="" className="h-12 w-12 shrink-0 rounded-xl object-cover" />}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm first-letter:uppercase">{product.nombre}</p>
              <p className="whitespace-nowrap font-bold">
                {needsDesign && pricing.isFromPrice && <span className="text-xs font-normal text-dark-gray">Desde </span>}
                {formatPrice(displayTotal)}
              </p>
            </div>
            <button type="button" className="app-btn-cta shrink-0" onClick={needsDesign ? scrollToSelector : buyNow} disabled={!needsDesign && !canAddToCart}>
              {needsDesign ? "Elegir diseño" : "Comprar"}
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
