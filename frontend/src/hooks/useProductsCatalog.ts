"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { productosService } from "@/src/services/productos/productos.service";
import { useCart } from "@/src/context/CartContext";
import { useAuth } from "@/src/context/AuthContext";
import type { Product } from "@/types/products";
import { toNumber } from "@/src/utils/formatters";

export function useProductsCatalog() {
  const router = useRouter();
  const { addItem, totalItems } = useCart();
  const { isAuthenticated, loading: authLoading } = useAuth();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeImageByProduct, setActiveImageByProduct] = useState<Record<number, number>>({});

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await productosService.getAllProducts();
        setProducts(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "No se pudieron cargar los productos");
      } finally {
        setLoading(false);
      }
    };

    void loadProducts();
  }, []);

  useEffect(() => {
    if (!products.length) {
      return;
    }

    setActiveImageByProduct((prev) => {
      const next: Record<number, number> = {};
      for (const product of products) {
        next[product.id] = prev[product.id] ?? 0;
      }
      return next;
    });

    const interval = window.setInterval(() => {
      setActiveImageByProduct((prev) => {
        const next: Record<number, number> = { ...prev };

        for (const product of products) {
          const fotos = product.fotos ?? [];
          if (fotos.length <= 1) {
            next[product.id] = 0;
            continue;
          }

          const current = prev[product.id] ?? 0;
          next[product.id] = current >= fotos.length - 1 ? 0 : current + 1;
        }

        return next;
      });
    }, 3000);

    return () => window.clearInterval(interval);
  }, [products]);

  const hasProducts = useMemo(() => products.length > 0, [products]);

  const goToCheckout = () => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login?redirect=/checkout");
      return;
    }

    router.push("/checkout");
  };

  const addProductToCart = (product: Product) => {
    const stock = toNumber(product.stock);
    if (stock <= 0) {
      return;
    }

    addItem({
      id: product.id,
      nombre: product.nombre,
      precio: toNumber(product.precio),
      stock,
      ancho: toNumber(product.ancho),
      alto: toNumber(product.alto),
      profundo: toNumber(product.profundo),
      fotoUrl: product.fotos?.[0]?.url,
      quantity: 1,
    });
  };

  return {
    products,
    loading,
    error,
    hasProducts,
    totalItems,
    activeImageByProduct,
    addProductToCart,
    goToCheckout,
  };
}
