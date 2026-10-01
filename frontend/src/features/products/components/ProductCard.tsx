"use client";

import Link from "next/link";
import type { Product } from "@/types/products";
import { formatPrice } from "@/shared/lib/formatters";
import { IconBagPlus } from "@/shared/ui/Icons";
import ProductPhoto from "@/shared/ui/ProductPhoto";
import {
  getDesignsWithPhoto,
  getProductImages,
  getProductPricing,
  getStockInfo,
  isMultiDesign,
} from "@/features/products/lib/presentation";

type ProductCardProps = {
  product: Product;
  onQuickAdd: (product: Product) => void;
  priority?: boolean;
};

export default function ProductCard({ product, onQuickAdd, priority = false }: ProductCardProps) {
  const images = getProductImages(product);
  const [primaryImage, secondaryImage] = images;
  const pricing = getProductPricing(product);
  const { stock, isSoldOut, isLowStock } = getStockInfo(product);
  const multiDesign = isMultiDesign(product);
  const designs = multiDesign ? getDesignsWithPhoto(product) : [];
  const productHref = `/products/${product.id}`;
  const quickAddLabel = multiDesign ? "Elegir diseño" : "Agregar al carrito";

  return (
    <article className="app-product-card">
      <div className="app-product-media">
        <Link href={productHref} className="absolute inset-0" aria-label={`Ver ${product.nombre}`}>
          {primaryImage ? (
            <ProductPhoto
              src={primaryImage}
              alt={`${product.nombre} artesanal - Tribal Trend`}
              loading={priority ? "eager" : "lazy"}
              fetchPriority={priority ? "high" : undefined}
            />
          ) : (
            <span className="absolute inset-0 grid place-items-center text-sm text-dark-gray">Foto próximamente</span>
          )}
          {secondaryImage && <ProductPhoto src={secondaryImage} alt="" className="app-product-media-alt" />}
        </Link>

        <div className="app-product-badges">
          {pricing.discountPercentage > 0 && (
            <span className="app-badge app-badge-sale">-{pricing.discountPercentage}%</span>
          )}
          {product.es_unico && !isSoldOut && <span className="app-badge app-badge-unique">Pieza única</span>}
          {!product.es_unico && isLowStock && (
            <span className="app-badge app-badge-urgent">{stock === 1 ? "¡Última!" : `¡Quedan ${stock}!`}</span>
          )}
        </div>

        {isSoldOut ? (
          <div className="app-product-soldout">
            <span className="app-badge app-badge-soft">Agotado</span>
          </div>
        ) : (
          <>
            <button type="button" className="app-quick-add" onClick={() => onQuickAdd(product)}>
              <IconBagPlus className="h-4 w-4" />
              {quickAddLabel}
            </button>
            <button
              type="button"
              className="app-quick-add-touch"
              onClick={() => onQuickAdd(product)}
              aria-label={`${quickAddLabel}: ${product.nombre}`}
            >
              <IconBagPlus className="h-5 w-5" />
            </button>
          </>
        )}
      </div>

      <Link href={productHref} className="group block px-1" tabIndex={-1}>
        <h3 className="truncate text-[0.95rem] text-dark-gray first-letter:uppercase group-hover:text-earth-brown">
          {product.nombre}
        </h3>
        <p className="mt-0.5 flex flex-wrap items-baseline gap-x-2">
          {pricing.isFromPrice && <span className="text-xs text-dark-gray">Desde</span>}
          <span className={`text-lg font-bold ${pricing.originalPrice ? "text-terracotta" : "text-black"}`}>
            {formatPrice(pricing.price)}
          </span>
          {pricing.originalPrice && (
            <span className="text-sm text-dark-gray/70 line-through">{formatPrice(pricing.originalPrice)}</span>
          )}
        </p>
        {designs.length > 1 && (
          <span className="mt-1.5 flex items-center gap-1" aria-label={`${designs.length} diseños disponibles`}>
            {designs.slice(0, 4).map((diseno) => (
              <img
                key={diseno.id}
                src={diseno.url_foto}
                alt=""
                className="h-5 w-5 rounded-full border border-cream object-cover shadow-sm"
                loading="lazy"
              />
            ))}
            {designs.length > 4 && <span className="text-xs text-dark-gray">+{designs.length - 4}</span>}
            <span className="ml-1 text-xs text-dark-gray">{designs.length} diseños</span>
          </span>
        )}
      </Link>
    </article>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="app-product-card" aria-hidden="true">
      <div className="app-product-media app-skeleton" />
      <div className="app-skeleton h-4 w-3/4 rounded-full" />
      <div className="app-skeleton h-5 w-1/3 rounded-full" />
    </div>
  );
}
