"use client";

import { useEffect, useState } from "react";
import { productosService } from "@/entities/productos/api/productos.service";
import type { Product } from "@/types/products";
import { toNumber } from "@/shared/lib/formatters";

const RELATED_LIMIT = 8;

// Otras piezas disponibles de la misma categoría; si no alcanzan, se completa con las más nuevas.
export function useRelatedProducts(product: Product | null) {
  const [related, setRelated] = useState<Product[]>([]);
  const productId = product?.id;
  const categoriaId = product?.categoria?.id;

  useEffect(() => {
    if (!productId) {
      return;
    }

    let active = true;
    const isCandidate = (item: Product) => item.id !== productId && item.es_activo !== false && toNumber(item.stock) > 0;

    const load = async () => {
      try {
        const sameCategory = categoriaId
          ? (await productosService.findByFilters({ id_categoria: categoriaId }, 1)).data.filter(isCandidate)
          : [];
        let candidates = sameCategory;

        if (candidates.length < RELATED_LIMIT) {
          const latest = (await productosService.getAllProducts(1)).data.filter(isCandidate);
          const seen = new Set(candidates.map((item) => item.id));
          candidates = [...candidates, ...latest.filter((item) => !seen.has(item.id))];
        }

        if (active) {
          setRelated(candidates.slice(0, RELATED_LIMIT));
        }
      } catch {
        if (active) {
          setRelated([]);
        }
      }
    };

    void load();

    return () => {
      active = false;
    };
  }, [productId, categoriaId]);

  return related;
}
