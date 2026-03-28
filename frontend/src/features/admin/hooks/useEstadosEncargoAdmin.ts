"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useToast } from "@/shared/providers/ToastContext";
import type { CrudModalMode } from "@/types/admin-ui";
import { estadosEncargoService } from "@/entities/estados-encargo/api/estados-encargo.service";
import type { EstadoEncargo, EstadoEncargoFormValues } from "@/types/estados-encargo";

const emptyForm: EstadoEncargoFormValues = {
  nombre: "",
};

export function useEstadosEncargoAdmin() {
  const { showToast } = useToast();
  const [estadosEncargo, setEstadosEncargo] = useState<EstadoEncargo[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selected, setSelected] = useState<EstadoEncargo | null>(null);
  const [mode, setMode] = useState<CrudModalMode>("create");
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const fetchEstadosEncargo = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await estadosEncargoService.getAll();
      setEstadosEncargo(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudieron cargar los estados de encargo");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchEstadosEncargo();
  }, [fetchEstadosEncargo]);

  const openCreate = () => {
    setSelected(null);
    setMode("create");
    setIsFormModalOpen(true);
  };

  const openEdit = (estado: EstadoEncargo) => {
    setSelected(estado);
    setMode("edit");
    setIsFormModalOpen(true);
  };

  const openView = (estado: EstadoEncargo) => {
    setSelected(estado);
    setMode("view");
    setIsFormModalOpen(true);
  };

  const closeForm = () => {
    setIsFormModalOpen(false);
  };

  const openDelete = (estado: EstadoEncargo) => {
    setSelected(estado);
    setIsDeleteModalOpen(true);
  };

  const closeDelete = () => {
    setIsDeleteModalOpen(false);
  };

  const initialValues = useMemo<EstadoEncargoFormValues>(() => {
    if (!selected) {
      return emptyForm;
    }

    return {
      nombre: selected.nombre,
    };
  }, [selected]);

  const submitForm = async (values: EstadoEncargoFormValues) => {
    if (mode === "view") {
      closeForm();
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      if (mode === "create") {
        await estadosEncargoService.create({ nombre: values.nombre.trim() });
        showToast("Estado de encargo creado correctamente", "success");
      } else if (mode === "edit" && selected) {
        await estadosEncargoService.update(selected.id, { nombre: values.nombre.trim() });
        showToast("Estado de encargo actualizado correctamente", "success");
      }

      setIsFormModalOpen(false);
      await fetchEstadosEncargo();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar el estado de encargo");
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
      await estadosEncargoService.remove(selected.id);
      showToast("Estado de encargo borrado correctamente", "success");
      setIsDeleteModalOpen(false);
      await fetchEstadosEncargo();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo borrar el estado de encargo");
    } finally {
      setSubmitting(false);
    }
  };

  const toggleEstadoEncargo = async (estado: EstadoEncargo) => {
    setSubmitting(true);
    setError(null);

    try {
      await estadosEncargoService.toggle(estado.id);
      showToast("Estado actualizado correctamente", "success");
      await fetchEstadosEncargo();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo actualizar el estado de encargo");
    } finally {
      setSubmitting(false);
    }
  };

  return {
    estadosEncargo,
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
    toggleEstadoEncargo,
    refresh: fetchEstadosEncargo,
  };
}
