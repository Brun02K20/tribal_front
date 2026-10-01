"use client";

import { useState } from "react";
import type { CSSProperties } from "react";

type ProductPhotoProps = {
  src: string;
  alt: string;
  className?: string;
  loading?: "eager" | "lazy";
  fetchPriority?: "high" | "low" | "auto";
  /**
   * Límite de ampliación respecto del tamaño real de la foto (ej. 1.5 = hasta 150%).
   * Las fotos del catálogo son chicas: sin tope se ven pixeladas y "agrandadas".
   */
  maxUpscale?: number;
  imgStyle?: CSSProperties;
};

// Muestra la foto completa (sin recortar) sobre un fondo desenfocado de la misma imagen,
// así la grilla queda pareja aunque cada foto tenga una proporción distinta.
export default function ProductPhoto({
  src,
  alt,
  className = "",
  loading = "lazy",
  fetchPriority,
  maxUpscale,
  imgStyle,
}: ProductPhotoProps) {
  const [natural, setNatural] = useState<{ src: string; width: number; height: number } | null>(null);

  const measure = (img: HTMLImageElement | null) => {
    if (!maxUpscale || !img?.complete || !img.naturalWidth || natural?.src === src) {
      return;
    }
    setNatural({ src, width: img.naturalWidth, height: img.naturalHeight });
  };

  const sizeCap = maxUpscale && natural?.src === src
    ? { maxWidth: natural.width * maxUpscale, maxHeight: natural.height * maxUpscale }
    : undefined;

  return (
    <span className={`app-photo ${className}`}>
      <img src={src} alt="" aria-hidden="true" className="app-photo-bg" loading={loading} decoding="async" />
      <img
        ref={measure}
        src={src}
        alt={alt}
        className="app-photo-main"
        loading={loading}
        fetchPriority={fetchPriority}
        decoding="async"
        onLoad={(event) => measure(event.currentTarget)}
        style={{ ...sizeCap, ...imgStyle }}
      />
    </span>
  );
}
