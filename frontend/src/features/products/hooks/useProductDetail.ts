"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { productosService } from "@/entities/productos/api/productos.service";
import { useCart } from "@/shared/providers/CartContext";
import { useToast } from "@/shared/providers/ToastContext";
import { useAuth } from "@/shared/providers/AuthContext";
import type { Product } from "@/types/products";
import { toNumber } from "@/shared/lib/formatters";

export function useProductDetail(productId: number) {
  const router = useRouter();
  const { addItem, totalItems, openCart } = useCart();
  const { showToast } = useToast();
  const { isAuthenticated, loading: authLoading } = useAuth();

  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedDesignUrls, setSelectedDesignUrls] = useState<string[]>([]);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await productosService.getProductById(productId);
        setProduct(data);
        setActiveImageIndex(0);
        setSelectedDesignUrls([]);
        setQuantity(1);
      } catch (err) {
        setError(err instanceof Error ? err.message : "No se pudo cargar el producto");
      } finally {
        setLoading(false);
      }
    };

    if (!Number.isFinite(productId)) {
      setError("ID de producto inválido");
      setLoading(false);
      return;
    }

    void loadProduct();
  }, [productId]);

  const stock = useMemo(() => (product ? toNumber(product.stock) : 0), [product]);
  const fotos = product?.fotos ?? [];
  const activeFoto = fotos.length > 0 ? fotos[Math.min(activeImageIndex, fotos.length - 1)] : null;

  const goToCheckout = () => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login?redirect=/checkout");
      return;
    }

    router.push("/checkout");
  };

  // Devuelve true si el producto quedó en el carrito (aunque ya estuviera al tope de stock).
  const putCurrentProductInCart = () => {
    if (!product || stock <= 0) {
      return false;
    }

    if (!product.es_unico && selectedDesignUrls.length !== quantity) {
      return false;
    }

    const priceByUrl = new Map(
      (product.disenos ?? [])
        .filter((diseno) => diseno.url_foto)
        .map((diseno) => [diseno.url_foto as string, toNumber(diseno.precio)]),
    );
    const totalDesignPrice = selectedDesignUrls.reduce((acc, url) => acc + (priceByUrl.get(url) ?? 0), 0);
    const precioOriginal = product.es_unico || totalDesignPrice === 0
      ? toNumber(product.precio)
      : Number((totalDesignPrice / Math.max(quantity, 1)).toFixed(2));
    const precioFinal = product.es_unico ? toNumber(product.precio_final ?? precioOriginal) : precioOriginal;

    const added = addItem({
      id: product.id,
      nombre: product.nombre,
      precio: precioFinal,
      precio_original: precioOriginal,
      id_descuento: product.es_unico ? product.descuento_aplicado?.id_descuento ?? null : null,
      porcentaje_descuento: product.es_unico ? product.descuento_aplicado?.porcentaje : undefined,
      stock,
      ancho: toNumber(product.ancho),
      alto: toNumber(product.alto),
      profundo: toNumber(product.profundo),
      fotoUrl: product.es_unico ? product.fotos?.[0]?.url : selectedDesignUrls[0] ?? product.fotos?.[0]?.url,
      quantity,
      es_unico: product.es_unico,
      disenos_urls: product.es_unico ? null : selectedDesignUrls,
    });
    if (!added) {
      showToast("Ya tenés todas las unidades disponibles de esta pieza en tu carrito.", "info");
    }
    return true;
  };

  const addCurrentProductToCart = () => {
    if (putCurrentProductInCart()) {
      openCart();
    }
  };

  const buyNow = () => {
    if (putCurrentProductInCart()) {
      goToCheckout();
    }
  };

  const updateQuantity = (value: number) => {
    if (!Number.isFinite(value)) {
      return;
    }

    const max = Math.max(stock, 1);
    const nextQuantity = Math.min(Math.max(1, Math.floor(value)), max);
    setQuantity(nextQuantity);
    setSelectedDesignUrls((prev) => prev.slice(0, nextQuantity));
  };

  const updateDesignUrlQuantity = (url: string, nextValue: number) => {
    if (!product || !url) {
      return;
    }

    const design = (product.disenos ?? []).find((item) => item.url_foto === url);
    const max = Math.max(0, Number(design?.stock ?? 0));
    const safeQuantity = Math.min(Math.max(0, Math.floor(nextValue)), max);

    setSelectedDesignUrls((prev) => {
      const next = [
        ...prev.filter((item) => item !== url),
        ...Array.from({ length: safeQuantity }, () => url),
      ];
      setQuantity(Math.max(1, next.length));
      return next;
    });
  };

  const toggleDesignUrl = (url: string) => {
    setSelectedDesignUrls((prev) => {
      if (prev.includes(url)) {
        return prev.filter((item) => item !== url);
      }
      if (prev.length >= quantity) {
        return prev;
      }
      return [...prev, url];
    });
  };

  const canAddToCart = Boolean(product)
    && stock > 0
    && (product?.es_unico || selectedDesignUrls.length === quantity);

  const goToPrevImage = () => {
    setActiveImageIndex((prev) => (prev === 0 ? fotos.length - 1 : prev - 1));
  };

  const goToNextImage = () => {
    setActiveImageIndex((prev) => (prev === fotos.length - 1 ? 0 : prev + 1));
  };

  return {
    product,
    quantity,
    loading,
    error,
    stock,
    fotos,
    activeFoto,
    activeImageIndex,
    selectedDesignUrls,
    canAddToCart,
    totalItems,
    setActiveImageIndex,
    updateQuantity,
    updateDesignUrlQuantity,
    toggleDesignUrl,
    goToPrevImage,
    goToNextImage,
    addCurrentProductToCart,
    buyNow,
    goToCheckout,
  };
}

