"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { descuentosService } from "@/entities/descuentos/api/descuentos.service";
import { categoriasService } from "@/entities/categorias/api/categorias.service";
import { subcategoriasService } from "@/entities/subcategorias/api/subcategorias.service";
import { useToast } from "@/shared/providers/ToastContext";
import type { CrudModalMode } from "@/types/admin-ui";
import type { CategoriaWithSubcategorias } from "@/types/categorias";
import type {
  Descuento,
  DescuentoEstado,
  DescuentoFilters,
  DescuentoFormValues,
  DescuentoTipo,
} from "@/types/descuentos";
import type { Subcategoria } from "@/types/subcategorias";

type DescuentoFiltersForm = {
  tipo: "" | DescuentoTipo;
  estado: "" | DescuentoEstado;
};

const EMPTY_FILTERS: DescuentoFiltersForm = {
  tipo: "",
  estado: "",
};

const EMPTY_FORM: DescuentoFormValues = {
  porcentaje: 1,
  tipo: "",
  id_referencia: 0,
  fecha_inicio: "",
  fecha_fin: "",
};

const toDateTimeLocalInput = (value: string) => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "";
  }

  const localDate = new Date(parsed.getTime() - parsed.getTimezoneOffset() * 60000);
  return localDate.toISOString().slice(0, 16);
};

const toApiDate = (value: string) => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "";
  }

  return parsed.toISOString();
};

const normalizeFilters = (form: DescuentoFiltersForm): DescuentoFilters => ({
  tipo: form.tipo || undefined,
  estado: form.estado || undefined,
});

export function useDescuentosAdmin() {
  const { showToast } = useToast();

  const [descuentos, setDescuentos] = useState<Descuento[]>([]);
  const [categorias, setCategorias] = useState<CategoriaWithSubcategorias[]>([]);
  const [subcategorias, setSubcategorias] = useState<Subcategoria[]>([]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [filtersForm, setFiltersForm] = useState<DescuentoFiltersForm>(EMPTY_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState<DescuentoFilters>({});

  const [selected, setSelected] = useState<Descuento | null>(null);
  const [mode, setMode] = useState<CrudModalMode>("create");
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [descuentosData, categoriasData, subcategoriasData] = await Promise.all([
        descuentosService.getAll(appliedFilters),
        categoriasService.getAll(),
        subcategoriasService.getAll(),
      ]);
      setDescuentos(descuentosData);
      setCategorias(categoriasData);
      setSubcategorias(subcategoriasData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudieron cargar los descuentos");
    } finally {
      setLoading(false);
    }
  }, [appliedFilters]);

  useEffect(() => {
    void fetchAll();
  }, [fetchAll]);

  const updateFilterField = (field: keyof DescuentoFiltersForm, value: string) => {
    setFiltersForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const applyFilters = () => {
    setAppliedFilters(normalizeFilters(filtersForm));
  };

  const clearFilters = () => {
    setFiltersForm(EMPTY_FILTERS);
    setAppliedFilters({});
  };

  const openCreate = () => {
    setSelected(null);
    setMode("create");
    setIsFormModalOpen(true);
  };

  const openEdit = (descuento: Descuento) => {
    setSelected(descuento);
    setMode("edit");
    setIsFormModalOpen(true);
  };

  const openView = (descuento: Descuento) => {
    setSelected(descuento);
    setMode("view");
    setIsFormModalOpen(true);
  };

  const closeForm = () => {
    setIsFormModalOpen(false);
  };

  const openDelete = (descuento: Descuento) => {
    setSelected(descuento);
    setIsDeleteModalOpen(true);
  };

  const closeDelete = () => {
    setIsDeleteModalOpen(false);
  };

  const initialValues = useMemo<DescuentoFormValues>(() => {
    if (!selected) {
      return EMPTY_FORM;
    }

    const tipo = selected.tipo;
    const idReferencia = tipo === "producto"
      ? Number(selected.id_producto ?? 0)
      : tipo === "subcategoria"
        ? Number(selected.id_subcategoria ?? 0)
        : Number(selected.id_categoria ?? 0);

    return {
      porcentaje: Number(selected.porcentaje),
      tipo,
      id_referencia: idReferencia,
      fecha_inicio: toDateTimeLocalInput(selected.fecha_inicio),
      fecha_fin: toDateTimeLocalInput(selected.fecha_fin),
    };
  }, [selected]);

  const submitForm = async (values: DescuentoFormValues) => {
    if (mode === "view") {
      closeForm();
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      if (values.tipo !== "producto" && values.tipo !== "subcategoria" && values.tipo !== "categoria") {
        throw new Error("Debe seleccionar un tipo de descuento");
      }

      const payload = {
        porcentaje: Number(values.porcentaje),
        fecha_inicio: toApiDate(values.fecha_inicio),
        fecha_fin: toApiDate(values.fecha_fin),
        id_producto: values.tipo === "producto" ? Number(values.id_referencia) : undefined,
        id_subcategoria: values.tipo === "subcategoria" ? Number(values.id_referencia) : undefined,
        id_categoria: values.tipo === "categoria" ? Number(values.id_referencia) : undefined,
      };

      if (mode === "create") {
        await descuentosService.create(payload);
        showToast("Descuento creado correctamente", "success");
      } else if (mode === "edit" && selected) {
        await descuentosService.update(selected.id, payload);
        showToast("Descuento actualizado correctamente", "success");
      }

      setIsFormModalOpen(false);
      await fetchAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar el descuento");
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
      await descuentosService.remove(selected.id);
      showToast("Descuento eliminado correctamente", "success");
      setIsDeleteModalOpen(false);
      await fetchAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo eliminar el descuento");
    } finally {
      setSubmitting(false);
    }
  };

  return {
    descuentos,
    categorias,
    subcategorias,
    loading,
    submitting,
    error,
    selected,
    mode,
    isFormModalOpen,
    isDeleteModalOpen,
    filtersForm,
    initialValues,
    openCreate,
    openEdit,
    openView,
    closeForm,
    openDelete,
    closeDelete,
    updateFilterField,
    applyFilters,
    clearFilters,
    submitForm,
    confirmDelete,
    refresh: fetchAll,
  };
}
