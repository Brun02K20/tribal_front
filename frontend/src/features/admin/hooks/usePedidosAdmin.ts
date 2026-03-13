"use client";

import { useEffect, useState } from "react";
import { pedidosService } from "@/entities/pedidos/api/pedidos.service";
import { useToast } from "@/shared/providers/ToastContext";
import type { PedidoEstadoMode } from "@/types/admin-ui";
import type { EstadoEnvioOption, EstadoPedidoOption, PedidoAdmin, PedidoFilters } from "@/types/pedidos";
import { useFilterForm } from "@/shared/lib/filter-form";

type PedidoFiltersForm = {
  nombre_usuario: string;
  email_usuario: string;
  fecha_pedido_min: string;
  fecha_pedido_max: string;
  id_estado_pedido: string;
  id_estado_envio: string;
};

const DEFAULT_FILTERS_FORM: PedidoFiltersForm = {
  nombre_usuario: "",
  email_usuario: "",
  fecha_pedido_min: "",
  fecha_pedido_max: "",
  id_estado_pedido: "",
  id_estado_envio: "",
};

const normalizeFilters = (form: PedidoFiltersForm): PedidoFilters => {
  const idEstadoPedido = Number(form.id_estado_pedido);
  const idEstadoEnvio = Number(form.id_estado_envio);

  return {
    nombre_usuario: form.nombre_usuario.trim() || undefined,
    email_usuario: form.email_usuario.trim() || undefined,
    fecha_pedido_min: form.fecha_pedido_min || undefined,
    fecha_pedido_max: form.fecha_pedido_max || undefined,
    id_estado_pedido: Number.isFinite(idEstadoPedido) && idEstadoPedido > 0 ? idEstadoPedido : undefined,
    id_estado_envio: Number.isFinite(idEstadoEnvio) && idEstadoEnvio > 0 ? idEstadoEnvio : undefined,
  };
};

const hasFilters = (filters: PedidoFilters) =>
  Boolean(
    filters.nombre_usuario
    || filters.email_usuario
    || filters.fecha_pedido_min
    || filters.fecha_pedido_max
    || filters.id_estado_pedido
    || filters.id_estado_envio,
  );

export function usePedidosAdmin() {
  const { showToast } = useToast();
  const [pedidos, setPedidos] = useState<PedidoAdmin[]>([]);
  const [estadosPedido, setEstadosPedido] = useState<EstadoPedidoOption[]>([]);
  const [estadosEnvio, setEstadosEnvio] = useState<EstadoEnvioOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [appliedFilters, setAppliedFilters] = useState<PedidoFilters>({});
  const {
    registerFilters,
    applyFilters,
    clearFilters,
  } = useFilterForm<PedidoFiltersForm, PedidoFilters>({
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
  const [selectedPedido, setSelectedPedido] = useState<PedidoAdmin | null>(null);
  const [editEstadoMode, setEditEstadoMode] = useState<PedidoEstadoMode | null>(null);
  const [isEstadoModalOpen, setIsEstadoModalOpen] = useState(false);

  const loadAll = async () => {
    setLoading(true);
    setError(null);

    try {
      const shouldUseFilters = hasFilters(appliedFilters);
      const [pedidosData, estadosPedidoData, estadosEnvioData] = await Promise.all([
        shouldUseFilters
          ? pedidosService.findByFilters(appliedFilters, page, pageSize)
          : pedidosService.getAllForAdmin(page, pageSize),
        pedidosService.getEstadosPedido(),
        pedidosService.getEstadosEnvio(),
      ]);

      setPedidos(pedidosData.data);
      setTotalPages(pedidosData.totalPages);
      setTotalItems(pedidosData.totalItems);
      setEstadosPedido(estadosPedidoData.filter((estado) => estado.esActivo));
      setEstadosEnvio(estadosEnvioData.filter((estado) => estado.esActivo));
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudieron cargar los pedidos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadAll();
  }, [page, pageSize, appliedFilters]);

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

  const openPedidoEstadoModal = (pedido: PedidoAdmin) => {
    setSelectedPedido(pedido);
    setEditEstadoMode("pedido");
    setIsEstadoModalOpen(true);
  };

  const openEnvioEstadoModal = (pedido: PedidoAdmin) => {
    setSelectedPedido(pedido);
    setEditEstadoMode("envio");
    setIsEstadoModalOpen(true);
  };

  const closeEstadoModal = () => {
    setIsEstadoModalOpen(false);
    setEditEstadoMode(null);
    setSelectedPedido(null);
  };

  const saveEstado = async (idEstado: number) => {
    if (!selectedPedido || !editEstadoMode) {
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      if (editEstadoMode === "pedido") {
        await pedidosService.updateEstadoPedido(selectedPedido.id, idEstado);
      } else {
        await pedidosService.updateEstadoEnvio(selectedPedido.id, idEstado);
      }

      showToast("Estado actualizado correctamente", "success");

      closeEstadoModal();
      await loadAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo actualizar el estado");
    } finally {
      setSubmitting(false);
    }
  };

  const currentEstadoId = editEstadoMode === "pedido"
    ? Number(selectedPedido?.estado_pedido?.id ?? 0)
    : Number(selectedPedido?.envio?.estado_envio?.id ?? 0);

  const currentOptions = editEstadoMode === "pedido" ? estadosPedido : estadosEnvio;

  return {
    pedidos,
    estadosPedido,
    estadosEnvio,
    loading,
    submitting,
    error,
    selectedPedido,
    editEstadoMode,
    isEstadoModalOpen,
    page,
    pageSize,
    totalPages,
    totalItems,
    registerFilters,
    currentEstadoId,
    currentOptions,
    applyFilters,
    clearFilters,
    goToPage,
    changePageSize,
    openPedidoEstadoModal,
    openEnvioEstadoModal,
    closeEstadoModal,
    saveEstado,
  };
}

