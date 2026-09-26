"use client";

import Link from "next/link";
import { useId } from "react";
import type { Product } from "@/types/products";
import { formatPrice } from "@/shared/lib/formatters";
import { getProductImages, getProductPricing } from "@/features/products/lib/presentation";

type HeroCollageProps = {
  products: Product[];
};

const slots = [
  { frame: "app-arch", position: "left-0 top-6 h-[86%] w-[58%]", tag: "left-4 -bottom-3" },
  { frame: "app-round-frame", position: "right-1 top-0 aspect-square w-[39%]", tag: "right-0 -bottom-2" },
  { frame: "app-arch", position: "right-5 bottom-2 h-[46%] w-[33%]", tag: "right-0 -bottom-3" },
] as const;

function HandmadeStamp() {
  const pathId = useId();

  return (
    <div className="pointer-events-none absolute left-[53%] top-[44%] z-10 h-24 w-24 -translate-x-1/2 -translate-y-1/2 md:h-28 md:w-28" aria-hidden="true">
      <svg viewBox="0 0 100 100" className="h-full w-full drop-shadow-lg motion-safe:animate-[spin_26s_linear_infinite]">
        <defs>
          <path id={pathId} d="M50,50 m-36,0 a36,36 0 1,1 72,0 a36,36 0 1,1 -72,0" />
        </defs>
        <circle cx="50" cy="50" r="49" fill="var(--color-terracotta)" />
        <circle cx="50" cy="50" r="46" fill="none" stroke="var(--color-cream)" strokeOpacity="0.45" strokeWidth="0.6" />
        <text fontSize="8.6" fill="var(--color-cream)" fontFamily="var(--font-oldenburg), serif">
          {/* textLength = circunferencia del trazo (2π·36), así el texto cierra justo el círculo */}
          <textPath href={`#${pathId}`} textLength="224" lengthAdjust="spacing">
            HECHO A MANO ✦ PIEZAS ÚNICAS ✦
          </textPath>
        </text>
      </svg>
      <span className="absolute inset-0 grid place-items-center text-2xl text-mustard">✦</span>
    </div>
  );
}

export default function HeroCollage({ products }: HeroCollageProps) {
  const featured = products.filter((product) => getProductImages(product).length > 0).slice(0, slots.length);
  const isLoading = featured.length === 0;

  return (
    <div className="relative mx-auto h-[280px] w-full max-w-[560px] sm:h-[420px] md:h-[520px]">
      <div className="pointer-events-none absolute inset-10 rounded-full bg-mustard/25 blur-3xl" aria-hidden="true" />

      {slots.map((slot, index) => {
        const product = featured[index];
        if (isLoading || !product) {
          return (
            <div
              key={`slot-${index}`}
              className={`app-skeleton absolute ${slot.position} ${slot.frame === "app-arch" ? "rounded-t-full rounded-b-3xl" : "rounded-full"}`}
            />
          );
        }

        const image = getProductImages(product)[0];
        const pricing = getProductPricing(product);

        return (
          <div key={product.id} className={`absolute ${slot.position}`}>
            <Link href={`/products/${product.id}`} className={`${slot.frame} block h-full w-full`} aria-label={`Ver ${product.nombre}`}>
              <img
                src={image}
                alt={`${product.nombre} artesanal`}
                loading="eager"
                fetchPriority={index === 0 ? "high" : undefined}
                decoding="async"
              />
            </Link>
            <Link href={`/products/${product.id}`} className={`app-price-tag absolute ${slot.tag}`} tabIndex={-1}>
              <span className="max-w-28 truncate first-letter:uppercase">{product.nombre}</span>
              <span className="font-bold text-terracotta">{formatPrice(pricing.price)}</span>
            </Link>
          </div>
        );
      })}

      {!isLoading && <HandmadeStamp />}
    </div>
  );
}
