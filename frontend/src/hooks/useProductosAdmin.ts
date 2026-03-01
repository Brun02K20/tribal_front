"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { CrudModalMode } from "@/types/admin-ui";
import { useToast } from "@/src/context/ToastContext";
import { categoriasService } from "@/src/services/categorias/categorias.service";
import { subcategoriasService } from "@/src/services/subcategorias/subcategorias.service";
import { productosService } from "@/src/services/productos/productos.service";
import type { Product, ProductFormValues } from "@/types/products";
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

export function useProductosAdmin() {
  const { showToast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [categorias, setCategorias] = useState<CategoriaWithSubcategorias[]>([]);
  const [subcategorias, setSubcategorias] = useState<Subcategoria[]>([]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selected, setSelected] = useState<Product | null>(null);
  const [mode, setMode] = useState<CrudModalMode>("create");
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [productsData, categoriasData, subcategoriasData] = await Promise.all([
        productosService.getAllProductsForAdmin(),
        categoriasService.getAll(),
        subcategoriasService.getAll(),
      ]);

      setProducts(productsData);
      setCategorias(categoriasData);
      setSubcategorias(subcategoriasData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudieron cargar los productos");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

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
    refresh: loadAll,
  };
}
