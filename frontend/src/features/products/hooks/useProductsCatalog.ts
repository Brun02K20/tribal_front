"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { productosService } from "@/entities/productos/api/productos.service";
import { categoriasService } from "@/entities/categorias/api/categorias.service";
import { subcategoriasService } from "@/entities/subcategorias/api/subcategorias.service";
import { useCart } from "@/shared/providers/CartContext";
import { useAuth } from "@/shared/providers/AuthContext";
import type { PaginatedProductsResponse, Product, ProductFilters } from "@/types/products";
import { toNumber } from "@/shared/lib/formatters";
import type { CategoriaWithSubcategorias } from "@/types/categorias";
import type { Subcategoria } from "@/types/subcategorias";
import { useWatch } from "react-hook-form";
import { useFilterForm } from "@/shared/lib/filter-form";

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

const PUBLIC_PRODUCTS_PAGE_SIZE = 12;
const PREFETCH_DELAY_MS = 2000;

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
  const [appliedFilters, setAppliedFilters] = useState<ProductFilters>({});
  const [page, setPage] = useState(1);
  const [pageSize] = useState(PUBLIC_PRODUCTS_PAGE_SIZE);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItemsCount, setTotalItemsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeImageByProduct, setActiveImageByProduct] = useState<Record<number, number>>({});
  const [designProduct, setDesignProduct] = useState<Product | null>(null);
  const [designQuantity, setDesignQuantity] = useState(1);
  const [selectedDesignUrls, setSelectedDesignUrls] = useState<string[]>([]);
  const productsCacheRef = useRef<Record<string, Record<number, PaginatedProductsResponse>>>({});
  const {
    registerFilters,
    applyFilters,
    clearFilters,
    control,
    getValues,
    setValue,
  } = useFilterForm<ProductFiltersForm, ProductFilters>({
    defaultValues: DEFAULT_FILTERS_FORM,
    normalize: normalizeFilters,
    onApply: (filters) => {
      setPage(1);
      setAppliedFilters(filters);
    },
    onClear: (filters) => {
      setPage(1);
      setAppliedFilters(filters);
    },
  });

  const selectedCategoriaFilter = useWatch({ control, name: "id_categoria" });
  const selectedCategoriaId = Number(selectedCategoriaFilter ?? 0);

  const filteredSubcategorias = useMemo(() => {
    if (!Number.isFinite(selectedCategoriaId) || selectedCategoriaId <= 0) {
      return subcategorias;
    }

    return subcategorias.filter((subcategoria) => subcategoria.id_categoria === selectedCategoriaId);
  }, [selectedCategoriaId, subcategorias]);
  const productsCacheKey = useMemo(() => JSON.stringify(appliedFilters), [appliedFilters]);

  useEffect(() => {
    const selectedSubcategoriaId = Number(getValues("id_subcategoria") || 0);
    if (!selectedSubcategoriaId) {
      return;
    }

    const subcategoriaValida = subcategorias.some((subcategoria) => {
      if (subcategoria.id !== selectedSubcategoriaId) {
        return false;
      }

      if (!Number.isFinite(selectedCategoriaId) || selectedCategoriaId <= 0) {
        return true;
      }

      return subcategoria.id_categoria === selectedCategoriaId;
    });

    if (!subcategoriaValida) {
      setValue("id_subcategoria", "");
    }
  }, [getValues, selectedCategoriaId, setValue, subcategorias]);

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
    let active = true;

    const loadProducts = async () => {
      try {
        setError(null);

        const cachedResponse = productsCacheRef.current[productsCacheKey]?.[page];
        if (cachedResponse) {
          setProducts(cachedResponse.data);
          setTotalPages(cachedResponse.totalPages);
          setTotalItemsCount(cachedResponse.totalItems);
          setLoading(false);
          return;
        }

        setLoading(true);
        const shouldUseFilters = hasFiltersApplied(appliedFilters);
        const response = shouldUseFilters
          ? await productosService.findByFilters(appliedFilters, page)
          : await productosService.getAllProducts(page);

        if (!active) {
          return;
        }

        productsCacheRef.current[productsCacheKey] = {
          ...(productsCacheRef.current[productsCacheKey] ?? {}),
          [page]: response,
        };
        setProducts(response.data);
        setTotalPages(response.totalPages);
        setTotalItemsCount(response.totalItems);
      } catch (err) {
        setError(err instanceof Error ? err.message : "No se pudieron cargar los productos");
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void loadProducts();

    return () => {
      active = false;
    };
  }, [appliedFilters, page, productsCacheKey]);

  useEffect(() => {
    if (page >= totalPages) {
      return;
    }

    let cancelled = false;
    let nextPage = page + 1;
    let timeoutId: number | undefined;

    const prefetchNextPage = () => {
      if (cancelled || nextPage > totalPages) {
        return;
      }

      if (productsCacheRef.current[productsCacheKey]?.[nextPage]) {
        nextPage += 1;
        timeoutId = window.setTimeout(prefetchNextPage, PREFETCH_DELAY_MS);
        return;
      }

      const shouldUseFilters = hasFiltersApplied(appliedFilters);
      const request = shouldUseFilters
        ? productosService.findByFilters(appliedFilters, nextPage)
        : productosService.getAllProducts(nextPage);

      void request
        .then((response) => {
          if (cancelled) {
            return;
          }

          productsCacheRef.current[productsCacheKey] = {
            ...(productsCacheRef.current[productsCacheKey] ?? {}),
            [nextPage]: response,
          };
          nextPage += 1;
          timeoutId = window.setTimeout(prefetchNextPage, PREFETCH_DELAY_MS);
        })
        .catch(() => undefined);
    };

    timeoutId = window.setTimeout(prefetchNextPage, PREFETCH_DELAY_MS);

    return () => {
      cancelled = true;
      if (timeoutId !== undefined) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [appliedFilters, page, productsCacheKey, totalPages]);

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
          const fotos = product.es_unico ? product.fotos ?? [] : (product.disenos ?? []).filter((diseno) => Boolean(diseno.url_foto)).map((diseno) => ({
            id: diseno.id,
            url: diseno.url_foto as string,
            id_producto: diseno.id_producto,
          }));
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
      es_unico: product.es_unico,
      disenos_urls: null,
    });
  };

  const openDesignModal = (product: Product) => {
    const stock = toNumber(product.stock);
    if (stock <= 0) {
      return;
    }

    if (product.es_unico) {
      addProductToCart(product);
      return;
    }

    setDesignProduct(product);
    setDesignQuantity(1);
    setSelectedDesignUrls([]);
  };

  const closeDesignModal = () => {
    setDesignProduct(null);
    setSelectedDesignUrls([]);
    setDesignQuantity(1);
  };

  const updateDesignQuantity = (value: number) => {
    if (!Number.isFinite(value)) {
      return;
    }

    const max = Math.max(toNumber(designProduct?.stock ?? 1), 1);
    const nextQuantity = Math.min(Math.max(1, Math.floor(value)), max);
    setDesignQuantity(nextQuantity);
    setSelectedDesignUrls((prev) => prev.slice(0, nextQuantity));
  };

  const toggleDesignUrl = (url: string) => {
    setSelectedDesignUrls((prev) => {
      if (prev.includes(url)) {
        return prev.filter((item) => item !== url);
      }
      if (prev.length >= designQuantity) {
        return prev;
      }
      return [...prev, url];
    });
  };

  const confirmDesignProduct = () => {
    if (!designProduct || selectedDesignUrls.length !== designQuantity) {
      return;
    }

    const stock = toNumber(designProduct.stock);
    const selectedDisenos = (designProduct.disenos ?? []).filter((diseno) => diseno.url_foto && selectedDesignUrls.includes(diseno.url_foto));
    const totalDesignPrice = selectedDisenos.reduce((acc, diseno) => acc + toNumber(diseno.precio), 0);
    const precioOriginal = totalDesignPrice > 0
      ? Number((totalDesignPrice / Math.max(designQuantity, 1)).toFixed(2))
      : toNumber(designProduct.precio);
    const precioFinal = precioOriginal;

    addItem({
      id: designProduct.id,
      nombre: designProduct.nombre,
      precio: precioFinal,
      precio_original: precioOriginal,
      id_descuento: null,
      porcentaje_descuento: undefined,
      stock,
      ancho: toNumber(designProduct.ancho),
      alto: toNumber(designProduct.alto),
      profundo: toNumber(designProduct.profundo),
      fotoUrl: selectedDesignUrls[0] ?? designProduct.fotos?.[0]?.url,
      quantity: designQuantity,
      es_unico: false,
      disenos_urls: selectedDesignUrls,
    });

    closeDesignModal();
  };

  return {
    products,
    loading,
    error,
    hasProducts,
    hasActiveFilters,
    categorias,
    filteredSubcategorias,
    registerFilters,
    page,
    pageSize,
    totalPages,
    totalItemsCount,
    totalItems,
    activeImageByProduct,
    designProduct,
    designQuantity,
    selectedDesignUrls,
    applyFilters,
    clearFilters,
    goToPage,
    addProductToCart: openDesignModal,
    closeDesignModal,
    updateDesignQuantity,
    toggleDesignUrl,
    confirmDesignProduct,
    goToCheckout,
  };
}

