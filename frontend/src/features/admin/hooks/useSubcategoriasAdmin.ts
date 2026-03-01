"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { CrudModalMode } from "@/types/admin-ui";
import { useToast } from "@/shared/providers/ToastContext";
import { categoriasService } from "@/entities/categorias/api/categorias.service";
import { subcategoriasService } from "@/entities/subcategorias/api/subcategorias.service";
import type { CategoriaWithSubcategorias } from "@/types/categorias";
import type { Subcategoria, SubcategoriaFormValues } from "@/types/subcategorias";

const emptyForm: SubcategoriaFormValues = {
  nombre: "",
  id_categoria: 0,
};

export function useSubcategoriasAdmin() {
  const { showToast } = useToast();
  const [subcategorias, setSubcategorias] = useState<Subcategoria[]>([]);
  const [categorias, setCategorias] = useState<CategoriaWithSubcategorias[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selected, setSelected] = useState<Subcategoria | null>(null);
  const [mode, setMode] = useState<CrudModalMode>("create");
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [subcategoriasData, categoriasData] = await Promise.all([
        subcategoriasService.getAll(),
        categoriasService.getAll(),
      ]);

      setSubcategorias(subcategoriasData);
      setCategorias(categoriasData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudieron cargar las subcategorías");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchAll();
  }, [fetchAll]);

  const openCreate = () => {
    setSelected(null);
    setMode("create");
    setIsFormModalOpen(true);
  };

  const openEdit = (subcategoria: Subcategoria) => {
    setSelected(subcategoria);
    setMode("edit");
    setIsFormModalOpen(true);
  };

  const openView = (subcategoria: Subcategoria) => {
    setSelected(subcategoria);
    setMode("view");
    setIsFormModalOpen(true);
  };

  const closeForm = () => {
    setIsFormModalOpen(false);
  };

  const openDelete = (subcategoria: Subcategoria) => {
    setSelected(subcategoria);
    setIsDeleteModalOpen(true);
  };

  const closeDelete = () => {
    setIsDeleteModalOpen(false);
  };

  const initialValues = useMemo<SubcategoriaFormValues>(() => {
    if (!selected) {
      return {
        ...emptyForm,
        id_categoria: categorias[0]?.id ?? 0,
      };
    }

    return {
      nombre: selected.nombre,
      id_categoria: selected.id_categoria,
    };
  }, [categorias, selected]);

  const submitForm = async (values: SubcategoriaFormValues) => {
    if (mode === "view") {
      closeForm();
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      if (mode === "create") {
        await subcategoriasService.create({
          nombre: values.nombre.trim(),
          id_categoria: Number(values.id_categoria),
        });
        showToast("Subcategoría creada correctamente", "success");
      } else if (mode === "edit" && selected) {
        await subcategoriasService.update(selected.id, {
          nombre: values.nombre.trim(),
          id_categoria: Number(values.id_categoria),
        });
        showToast("Subcategoría actualizada correctamente", "success");
      }

      setIsFormModalOpen(false);
      await fetchAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar la subcategoría");
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
      await subcategoriasService.remove(selected.id);
      showToast("Subcategoría borrada correctamente", "success");
      setIsDeleteModalOpen(false);
      await fetchAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo borrar la subcategoría");
    } finally {
      setSubmitting(false);
    }
  };

  const toggleSubcategoria = async (subcategoria: Subcategoria) => {
    setSubmitting(true);
    setError(null);

    try {
      await subcategoriasService.toggle(subcategoria.id);
      showToast("Estado actualizado correctamente", "success");
      await fetchAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo actualizar el estado de la subcategoría");
    } finally {
      setSubmitting(false);
    }
  };

  const categoriasOptions = categorias.map((categoria) => ({
    value: categoria.id,
    label: categoria.nombre,
  }));

  const categoriaMap = new Map(categorias.map((categoria) => [categoria.id, categoria.nombre] as const));

  return {
    subcategorias,
    categoriasOptions,
    categoriaMap,
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
    submitForm,
    confirmDelete,
    toggleSubcategoria,
    refresh: fetchAll,
  };
}

