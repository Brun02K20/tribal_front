"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useToast } from "@/shared/providers/ToastContext";
import type { CrudModalMode } from "@/types/admin-ui";
import { estadosPedidoService } from "@/entities/estados-pedido/api/estados-pedido.service";
import type { EstadoPedido, EstadoPedidoFormValues } from "@/types/estados-pedido";

const emptyForm: EstadoPedidoFormValues = {
  nombre: "",
};

export function useEstadosPedidoAdmin() {
  const { showToast } = useToast();
  const [estadosPedido, setEstadosPedido] = useState<EstadoPedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selected, setSelected] = useState<EstadoPedido | null>(null);
  const [mode, setMode] = useState<CrudModalMode>("create");
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const fetchEstadosPedido = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await estadosPedidoService.getAll();
      setEstadosPedido(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudieron cargar los estados de pedido");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchEstadosPedido();
  }, [fetchEstadosPedido]);

  const openCreate = () => {
    setSelected(null);
    setMode("create");
    setIsFormModalOpen(true);
  };

  const openEdit = (estado: EstadoPedido) => {
    setSelected(estado);
    setMode("edit");
    setIsFormModalOpen(true);
  };

  const openView = (estado: EstadoPedido) => {
    setSelected(estado);
    setMode("view");
    setIsFormModalOpen(true);
  };

  const closeForm = () => {
    setIsFormModalOpen(false);
  };

  const openDelete = (estado: EstadoPedido) => {
    setSelected(estado);
    setIsDeleteModalOpen(true);
  };

  const closeDelete = () => {
    setIsDeleteModalOpen(false);
  };

  const initialValues = useMemo<EstadoPedidoFormValues>(() => {
    if (!selected) {
      return emptyForm;
    }

    return {
      nombre: selected.nombre,
    };
  }, [selected]);

  const submitForm = async (values: EstadoPedidoFormValues) => {
    if (mode === "view") {
      closeForm();
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      if (mode === "create") {
        await estadosPedidoService.create({ nombre: values.nombre.trim() });
        showToast("Estado de pedido creado correctamente", "success");
      } else if (mode === "edit" && selected) {
        await estadosPedidoService.update(selected.id, { nombre: values.nombre.trim() });
        showToast("Estado de pedido actualizado correctamente", "success");
      }

      setIsFormModalOpen(false);
      await fetchEstadosPedido();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar el estado de pedido");
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
      await estadosPedidoService.remove(selected.id);
      showToast("Estado de pedido borrado correctamente", "success");
      setIsDeleteModalOpen(false);
      await fetchEstadosPedido();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo borrar el estado de pedido");
    } finally {
      setSubmitting(false);
    }
  };

  const toggleEstadoPedido = async (estado: EstadoPedido) => {
    setSubmitting(true);
    setError(null);

    try {
      await estadosPedidoService.toggle(estado.id);
      showToast("Estado actualizado correctamente", "success");
      await fetchEstadosPedido();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo actualizar el estado de pedido");
    } finally {
      setSubmitting(false);
    }
  };

  return {
    estadosPedido,
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
    toggleEstadoPedido,
    refresh: fetchEstadosPedido,
  };
}

