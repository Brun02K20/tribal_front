"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useToast } from "@/shared/providers/ToastContext";
import type { CrudModalMode } from "@/types/admin-ui";
import { estadosEnvioService } from "@/entities/estados-envio/api/estados-envio.service";
import type { EstadoEnvio, EstadoEnvioFormValues } from "@/types/estados-envio";

const emptyForm: EstadoEnvioFormValues = {
  nombre: "",
};

export function useEstadosEnvioAdmin() {
  const { showToast } = useToast();
  const [estadosEnvio, setEstadosEnvio] = useState<EstadoEnvio[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selected, setSelected] = useState<EstadoEnvio | null>(null);
  const [mode, setMode] = useState<CrudModalMode>("create");
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const fetchEstadosEnvio = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await estadosEnvioService.getAll();
      setEstadosEnvio(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudieron cargar los estados de envío");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchEstadosEnvio();
  }, [fetchEstadosEnvio]);

  const openCreate = () => {
    setSelected(null);
    setMode("create");
    setIsFormModalOpen(true);
  };

  const openEdit = (estado: EstadoEnvio) => {
    setSelected(estado);
    setMode("edit");
    setIsFormModalOpen(true);
  };

  const openView = (estado: EstadoEnvio) => {
    setSelected(estado);
    setMode("view");
    setIsFormModalOpen(true);
  };

  const closeForm = () => {
    setIsFormModalOpen(false);
  };

  const openDelete = (estado: EstadoEnvio) => {
    setSelected(estado);
    setIsDeleteModalOpen(true);
  };

  const closeDelete = () => {
    setIsDeleteModalOpen(false);
  };

  const initialValues = useMemo<EstadoEnvioFormValues>(() => {
    if (!selected) {
      return emptyForm;
    }

    return {
      nombre: selected.nombre,
    };
  }, [selected]);

  const submitForm = async (values: EstadoEnvioFormValues) => {
    if (mode === "view") {
      closeForm();
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      if (mode === "create") {
        await estadosEnvioService.create({ nombre: values.nombre.trim() });
        showToast("Estado de envío creado correctamente", "success");
      } else if (mode === "edit" && selected) {
        await estadosEnvioService.update(selected.id, { nombre: values.nombre.trim() });
        showToast("Estado de envío actualizado correctamente", "success");
      }

      setIsFormModalOpen(false);
      await fetchEstadosEnvio();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar el estado de envío");
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
      await estadosEnvioService.remove(selected.id);
      showToast("Estado de envío borrado correctamente", "success");
      setIsDeleteModalOpen(false);
      await fetchEstadosEnvio();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo borrar el estado de envío");
    } finally {
      setSubmitting(false);
    }
  };

  const toggleEstadoEnvio = async (estado: EstadoEnvio) => {
    setSubmitting(true);
    setError(null);

    try {
      await estadosEnvioService.toggle(estado.id);
      showToast("Estado actualizado correctamente", "success");
      await fetchEstadosEnvio();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo actualizar el estado de envío");
    } finally {
      setSubmitting(false);
    }
  };

  return {
    estadosEnvio,
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
    toggleEstadoEnvio,
    refresh: fetchEstadosEnvio,
  };
}

