"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { categoriasService } from "@/src/services/categorias/categorias.service";
import { useToast } from "@/src/context/ToastContext";
import type {
  Categoria,
  CategoriaFormValues,
  CategoriaWithSubcategorias,
} from "@/types/categorias";
import type { CrudModalMode } from "@/types/admin-ui";

const emptyForm: CategoriaFormValues = {
  nombre: "",
};

export function useCategoriasAdmin() {
  const { showToast } = useToast();
  const [categorias, setCategorias] = useState<CategoriaWithSubcategorias[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selected, setSelected] = useState<Categoria | null>(null);
  const [mode, setMode] = useState<CrudModalMode>("create");
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const fetchCategorias = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await categoriasService.getAll();
      setCategorias(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudieron cargar las categorías");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchCategorias();
  }, [fetchCategorias]);

  const openCreate = () => {
    setSelected(null);
    setMode("create");
    setIsFormModalOpen(true);
  };

  const openEdit = (categoria: Categoria) => {
    setSelected(categoria);
    setMode("edit");
    setIsFormModalOpen(true);
  };

  const openView = (categoria: Categoria) => {
    setSelected(categoria);
    setMode("view");
    setIsFormModalOpen(true);
  };

  const closeForm = () => {
    setIsFormModalOpen(false);
  };

  const openDelete = (categoria: Categoria) => {
    setSelected(categoria);
    setIsDeleteModalOpen(true);
  };

  const closeDelete = () => {
    setIsDeleteModalOpen(false);
  };

  const initialValues = useMemo<CategoriaFormValues>(() => {
    if (!selected) {
      return emptyForm;
    }

    return {
      nombre: selected.nombre,
    };
  }, [selected]);

  const submitForm = async (values: CategoriaFormValues) => {
    if (mode === "view") {
      closeForm();
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      if (mode === "create") {
        await categoriasService.create({ nombre: values.nombre.trim() });
        showToast("Categoría creada correctamente", "success");
      } else if (mode === "edit" && selected) {
        await categoriasService.update(selected.id, { nombre: values.nombre.trim() });
        showToast("Categoría actualizada correctamente", "success");
      }

      setIsFormModalOpen(false);
      await fetchCategorias();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar la categoría");
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
      await categoriasService.remove(selected.id);
      showToast("Categoría borrada correctamente", "success");
      setIsDeleteModalOpen(false);
      await fetchCategorias();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo borrar la categoría");
    } finally {
      setSubmitting(false);
    }
  };

  const toggleCategoria = async (categoria: Categoria) => {
    setSubmitting(true);
    setError(null);

    try {
      await categoriasService.toggle(categoria.id);
      showToast("Estado actualizado correctamente", "success");
      await fetchCategorias();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo actualizar el estado de la categoría");
    } finally {
      setSubmitting(false);
    }
  };

  return {
    categorias,
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
    toggleCategoria,
    refresh: fetchCategorias,
  };
}
