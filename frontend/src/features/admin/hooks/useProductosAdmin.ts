"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { CrudModalMode } from "@/types/admin-ui";
import { useToast } from "@/shared/providers/ToastContext";
import { categoriasService } from "@/entities/categorias/api/categorias.service";
import { subcategoriasService } from "@/entities/subcategorias/api/subcategorias.service";
import { productosService } from "@/entities/productos/api/productos.service";
import type { Product, ProductFilters, ProductFormValues } from "@/types/products";
import type { CategoriaWithSubcategorias } from "@/types/categorias";
import type { Subcategoria } from "@/types/subcategorias";

const emptyProductForm: ProductFormValues = {
  nombre: "",
  descripcion: "",
  precio: 0,
  stock: 0,
  id_categoria: 0,
  id_subcategoria: 0,
  ancho: 0,
  alto: 0,
  profundo: 0,
  peso_gramos: 0,
};

type AdminProductFiltersForm = {
  nombre: string;
  id_categoria: string;
  id_subcategoria: string;
  precio_min: string;
  precio_max: string;
};

const DEFAULT_ADMIN_FILTERS_FORM: AdminProductFiltersForm = {
  nombre: "",
  id_categoria: "",
  id_subcategoria: "",
  precio_min: "",
  precio_max: "",
};

const normalizeAdminFilters = (form: AdminProductFiltersForm): ProductFilters => {
  const idCategoria = Number(form.id_categoria);
  const idSubcategoria = Number(form.id_subcategoria);
  const precioMin = Number(form.precio_min);
  const precioMax = Number(form.precio_max);

  return {
    nombre: form.nombre.trim() || undefined,
    id_categoria: Number.isFinite(idCategoria) && idCategoria > 0 ? idCategoria : undefined,
    id_subcategoria: Number.isFinite(idSubcategoria) && idSubcategoria > 0 ? idSubcategoria : undefined,
    precio_min: Number.isFinite(precioMin) ? precioMin : undefined,
    precio_max: Number.isFinite(precioMax) ? precioMax : undefined,
  };
};

const hasFilters = (filters: ProductFilters) =>
  Boolean(
    filters.nombre
    || filters.id_categoria
    || filters.id_subcategoria
    || typeof filters.precio_min === "number"
    || typeof filters.precio_max === "number",
  );

export function useProductosAdmin() {
  const { showToast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [categorias, setCategorias] = useState<CategoriaWithSubcategorias[]>([]);
  const [subcategorias, setSubcategorias] = useState<Subcategoria[]>([]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [filtersForm, setFiltersForm] = useState<AdminProductFiltersForm>(DEFAULT_ADMIN_FILTERS_FORM);
  const [appliedFilters, setAppliedFilters] = useState<ProductFilters>({});

  const [selected, setSelected] = useState<Product | null>(null);
  const [mode, setMode] = useState<CrudModalMode>("create");
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const selectedFilterCategoriaId = Number(filtersForm.id_categoria);

  const subcategoriasFiltradasPorCategoria = useMemo(
    () =>
      Number.isFinite(selectedFilterCategoriaId) && selectedFilterCategoriaId > 0
        ? subcategorias.filter((subcategoria) => subcategoria.id_categoria === selectedFilterCategoriaId)
        : subcategorias,
    [selectedFilterCategoriaId, subcategorias],
  );

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const shouldFilter = hasFilters(appliedFilters);
      const [productsData, categoriasData, subcategoriasData] = await Promise.all([
        shouldFilter
          ? productosService.findByFiltersForAdmin(appliedFilters, page, pageSize)
          : productosService.getAllProductsForAdmin(page, pageSize),
        categoriasService.getAll(),
        subcategoriasService.getAll(),
      ]);

      setProducts(productsData.data);
      setTotalPages(productsData.totalPages);
      setTotalItems(productsData.totalItems);
      setCategorias(categoriasData);
      setSubcategorias(subcategoriasData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudieron cargar los productos");
    } finally {
      setLoading(false);
    }
  }, [appliedFilters, page, pageSize]);

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  const updateFilterField = (field: keyof AdminProductFiltersForm, value: string) => {
    setFiltersForm((prev) => {
      const next = { ...prev, [field]: value };
      if (field === "id_categoria") {
        next.id_subcategoria = "";
      }
      return next;
    });
  };

  const applyFilters = () => {
    setPage(1);
    setAppliedFilters(normalizeAdminFilters(filtersForm));
  };

  const clearFilters = () => {
    setFiltersForm(DEFAULT_ADMIN_FILTERS_FORM);
    setAppliedFilters({});
    setPage(1);
  };

  const goToPage = (nextPage: number) => {
    if (nextPage < 1 || nextPage > totalPages || nextPage === page) {
      return;
    }

    setPage(nextPage);
  };

  const changePageSize = (nextPageSize: number) => {
    if (![10, 15, 20].includes(nextPageSize)) {
      return;
    }

    setPageSize(nextPageSize);
    setPage(1);
  };

  const openCreate = () => {
    setSelected(null);
    setMode("create");
    setIsFormModalOpen(true);
  };

  const openEdit = (product: Product) => {
    setSelected(product);
    setMode("edit");
    setIsFormModalOpen(true);
  };

  const openView = (product: Product) => {
    setSelected(product);
    setMode("view");
    setIsFormModalOpen(true);
  };

  const closeForm = () => {
    setIsFormModalOpen(false);
  };

  const openDelete = (product: Product) => {
    setSelected(product);
    setIsDeleteModalOpen(true);
  };

  const closeDelete = () => {
    setIsDeleteModalOpen(false);
  };

  const initialValues = useMemo<ProductFormValues>(() => {
    if (!selected) {
      return {
        ...emptyProductForm,
        id_categoria: categorias[0]?.id ?? 0,
        id_subcategoria: subcategorias.find((sub) => sub.id_categoria === (categorias[0]?.id ?? -1))?.id ?? 0,
      };
    }

    return {
      nombre: selected.nombre,
      descripcion: selected.descripcion,
      precio: Number(selected.precio),
      stock: Number(selected.stock),
      id_categoria: selected.categoria.id,
      id_subcategoria: selected.subcategoria.id,
      ancho: Number(selected.ancho),
      alto: Number(selected.alto),
      profundo: Number(selected.profundo),
      peso_gramos: Number(selected.peso_gramos),
    };
  }, [categorias, selected, subcategorias]);

  const submitProduct = async (values: ProductFormValues, files: File[]) => {
    if (mode === "view") {
      closeForm();
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      if (mode === "create") {
        await productosService.createProduct(values, files);
        showToast("Producto creado correctamente", "success");
      } else if (mode === "edit" && selected) {
        await productosService.updateProduct(selected.id, values, files);
        showToast("Producto actualizado correctamente", "success");
      }

      setIsFormModalOpen(false);
      await loadAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar el producto");
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!selected) {
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await productosService.deleteProduct(selected.id);
      showToast("Producto borrado correctamente", "success");
      setIsDeleteModalOpen(false);
      await loadAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo borrar el producto");
    } finally {
      setSubmitting(false);
    }
  };

  const toggleProduct = async (product: Product) => {
    setSubmitting(true);
    setError(null);

    try {
      await productosService.toggleProduct(product.id);
      showToast("Estado actualizado correctamente", "success");
      await loadAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo cambiar el estado del producto");
    } finally {
      setSubmitting(false);
    }
  };

  return {
    products,
    categorias,
    subcategorias,
    loading,
    submitting,
    error,
    selected,
    mode,
    isFormModalOpen,
    isDeleteModalOpen,
    initialValues,
    openCreate,
    openEdit,
    openView,
    closeForm,
    openDelete,
    closeDelete,
    submitProduct,
    confirmDelete,
    toggleProduct,
    filtersForm,
    subcategoriasFiltradasPorCategoria,
    page,
    pageSize,
    totalPages,
    totalItems,
    updateFilterField,
    applyFilters,
    clearFilters,
    goToPage,
    changePageSize,
    refresh: loadAll,
  };
}

