"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { productosService } from "@/entities/productos/api/productos.service";
import { categoriasService } from "@/entities/categorias/api/categorias.service";
import { subcategoriasService } from "@/entities/subcategorias/api/subcategorias.service";
import { useCart } from "@/shared/providers/CartContext";
import { useAuth } from "@/shared/providers/AuthContext";
import type { Product, ProductFilters } from "@/types/products";
import { toNumber } from "@/shared/lib/formatters";
import type { CategoriaWithSubcategorias } from "@/types/categorias";
import type { Subcategoria } from "@/types/subcategorias";

type ProductFiltersForm = {
  nombre: string;
  id_categoria: string;
  id_subcategoria: string;
  precio_min: string;
  precio_max: string;
};

const DEFAULT_FILTERS_FORM: ProductFiltersForm = {
  nombre: "",
  id_categoria: "",
  id_subcategoria: "",
  precio_min: "",
  precio_max: "",
};

const normalizeFilters = (form: ProductFiltersForm): ProductFilters => {
  const parsedCategoria = Number(form.id_categoria);
  const parsedSubcategoria = Number(form.id_subcategoria);
  const parsedPrecioMin = Number(form.precio_min);
  const parsedPrecioMax = Number(form.precio_max);

  return {
    nombre: form.nombre.trim() || undefined,
    id_categoria: Number.isFinite(parsedCategoria) && parsedCategoria > 0 ? parsedCategoria : undefined,
    id_subcategoria: Number.isFinite(parsedSubcategoria) && parsedSubcategoria > 0 ? parsedSubcategoria : undefined,
    precio_min: Number.isFinite(parsedPrecioMin) ? parsedPrecioMin : undefined,
    precio_max: Number.isFinite(parsedPrecioMax) ? parsedPrecioMax : undefined,
  };
};

const hasFiltersApplied = (filters: ProductFilters) =>
  Boolean(
    filters.nombre
    || filters.id_categoria
    || filters.id_subcategoria
    || typeof filters.precio_min === "number"
    || typeof filters.precio_max === "number",
  );

export function useProductsCatalog() {
  const router = useRouter();
  const { addItem, totalItems } = useCart();
  const { isAuthenticated, loading: authLoading } = useAuth();

  const [products, setProducts] = useState<Product[]>([]);
  const [categorias, setCategorias] = useState<CategoriaWithSubcategorias[]>([]);
  const [subcategorias, setSubcategorias] = useState<Subcategoria[]>([]);
  const [filtersForm, setFiltersForm] = useState<ProductFiltersForm>(DEFAULT_FILTERS_FORM);
  const [appliedFilters, setAppliedFilters] = useState<ProductFilters>({});
  const [page, setPage] = useState(1);
  const [pageSize] = useState(18);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItemsCount, setTotalItemsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeImageByProduct, setActiveImageByProduct] = useState<Record<number, number>>({});

  const selectedCategoriaId = Number(filtersForm.id_categoria);

  const filteredSubcategorias = useMemo(() => {
    if (!Number.isFinite(selectedCategoriaId) || selectedCategoriaId <= 0) {
      return subcategorias;
    }

    return subcategorias.filter((subcategoria) => subcategoria.id_categoria === selectedCategoriaId);
  }, [selectedCategoriaId, subcategorias]);

  useEffect(() => {
    const loadFiltersCatalog = async () => {
      try {
        const [categoriasData, subcategoriasData] = await Promise.all([
          categoriasService.getAll(),
          subcategoriasService.getAll(),
        ]);
        setCategorias(categoriasData);
        setSubcategorias(subcategoriasData);
      } catch {
        setCategorias([]);
        setSubcategorias([]);
      }
    };

    void loadFiltersCatalog();
  }, []);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        const shouldUseFilters = hasFiltersApplied(appliedFilters);
        const response = shouldUseFilters
          ? await productosService.findByFilters(appliedFilters, page)
          : await productosService.getAllProducts(page);

        setProducts(response.data);
        setTotalPages(response.totalPages);
        setTotalItemsCount(response.totalItems);
      } catch (err) {
        setError(err instanceof Error ? err.message : "No se pudieron cargar los productos");
      } finally {
        setLoading(false);
      }
    };

    void loadProducts();
  }, [appliedFilters, page]);

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
  const hasActiveFilters = useMemo(() => hasFiltersApplied(appliedFilters), [appliedFilters]);

  const updateFilterField = (field: keyof ProductFiltersForm, value: string) => {
    setFiltersForm((prev) => {
      const next: ProductFiltersForm = { ...prev, [field]: value };

      if (field === "id_categoria") {
        next.id_subcategoria = "";
      }

      return next;
    });
  };

  const applyFilters = () => {
    setPage(1);
    setAppliedFilters(normalizeFilters(filtersForm));
  };

  const clearFilters = () => {
    setFiltersForm(DEFAULT_FILTERS_FORM);
    setAppliedFilters({});
    setPage(1);
  };

  const goToCheckout = () => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login?redirect=/checkout");
      return;
    }

    router.push("/checkout");
  };

  const goToPage = (nextPage: number) => {
    if (nextPage < 1 || nextPage > totalPages || nextPage === page) {
      return;
    }

    setPage(nextPage);
  };

  const addProductToCart = (product: Product) => {
    const stock = toNumber(product.stock);
    const precioOriginal = toNumber(product.precio);
    const precioFinal = toNumber(product.precio_final ?? precioOriginal);
    if (stock <= 0) {
      return;
    }

    addItem({
      id: product.id,
      nombre: product.nombre,
      precio: precioFinal,
      precio_original: precioOriginal,
      id_descuento: product.descuento_aplicado?.id_descuento ?? null,
      porcentaje_descuento: product.descuento_aplicado?.porcentaje,
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
    hasActiveFilters,
    categorias,
    filteredSubcategorias,
    filtersForm,
    page,
    pageSize,
    totalPages,
    totalItemsCount,
    totalItems,
    activeImageByProduct,
    updateFilterField,
    applyFilters,
    clearFilters,
    goToPage,
    addProductToCart,
    goToCheckout,
  };
}

