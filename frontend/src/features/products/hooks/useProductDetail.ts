"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { productosService } from "@/entities/productos/api/productos.service";
import { useCart } from "@/shared/providers/CartContext";
import { useAuth } from "@/shared/providers/AuthContext";
import type { Product } from "@/types/products";
import { toNumber } from "@/shared/lib/formatters";

export function useProductDetail(productId: number) {
  const router = useRouter();
  const { addItem, totalItems } = useCart();
  const { isAuthenticated, loading: authLoading } = useAuth();

  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
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

  const addCurrentProductToCart = () => {
    if (!product) {
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
      quantity,
    });
  };

  const updateQuantity = (value: number) => {
    if (!Number.isFinite(value)) {
      return;
    }

    const max = Math.max(stock, 1);
    setQuantity(Math.min(Math.max(1, Math.floor(value)), max));
  };

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
    totalItems,
    setActiveImageIndex,
    updateQuantity,
    goToPrevImage,
    goToNextImage,
    addCurrentProductToCart,
    goToCheckout,
  };
}

