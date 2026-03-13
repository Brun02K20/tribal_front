"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/shared/providers/AuthContext";
import { pedidosService } from "@/entities/pedidos/api/pedidos.service";
import type { EstadoEnvioOption, EstadoPedidoOption, PedidoCliente, PedidoFilters } from "@/types/pedidos";
import { useFilterForm } from "@/shared/lib/filter-form";

type MisPedidosFiltersForm = {
  fecha_pedido_min: string;
  fecha_pedido_max: string;
  id_estado_pedido: string;
  id_estado_envio: string;
};

const DEFAULT_FILTERS_FORM: MisPedidosFiltersForm = {
  fecha_pedido_min: "",
  fecha_pedido_max: "",
  id_estado_pedido: "",
  id_estado_envio: "",
};

const normalizeFilters = (form: MisPedidosFiltersForm, userId?: number): PedidoFilters => {
  const idEstadoPedido = Number(form.id_estado_pedido);
  const idEstadoEnvio = Number(form.id_estado_envio);

  return {
    id_usuario: userId,
    fecha_pedido_min: form.fecha_pedido_min || undefined,
    fecha_pedido_max: form.fecha_pedido_max || undefined,
    id_estado_pedido: Number.isFinite(idEstadoPedido) && idEstadoPedido > 0 ? idEstadoPedido : undefined,
    id_estado_envio: Number.isFinite(idEstadoEnvio) && idEstadoEnvio > 0 ? idEstadoEnvio : undefined,
  };
};

const hasFilters = (filters: PedidoFilters) =>
  Boolean(filters.fecha_pedido_min || filters.fecha_pedido_max || filters.id_estado_pedido || filters.id_estado_envio);

export function useMisPedidos() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();

  const [pedidos, setPedidos] = useState<PedidoCliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [estadosPedido, setEstadosPedido] = useState<EstadoPedidoOption[]>([]);
  const [estadosEnvio, setEstadosEnvio] = useState<EstadoEnvioOption[]>([]);
  const [appliedFilters, setAppliedFilters] = useState<PedidoFilters>({});
  const {
    registerFilters,
    applyFilters,
    clearFilters,
  } = useFilterForm<MisPedidosFiltersForm, PedidoFilters>({
    defaultValues: DEFAULT_FILTERS_FORM,
    normalize: (values) => normalizeFilters(values, user?.id),
    onApply: (filters) => {
      setPage(1);
      setAppliedFilters(filters);
    },
    onClear: (filters) => {
      setPage(1);
      setAppliedFilters(filters);
    },
  });

  const loadPedidos = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const shouldUseFilters = hasFilters(appliedFilters);
      const [response, estadosPedidoData, estadosEnvioData] = await Promise.all([
        shouldUseFilters
          ? pedidosService.findByFilters({ ...appliedFilters, id_usuario: user.id }, page, pageSize)
          : pedidosService.getAllForUser(user.id, page, pageSize),
        pedidosService.getEstadosPedido(),
        pedidosService.getEstadosEnvio(),
      ]);

      const invalidPedido = response.data.find((pedido) => Number(pedido.usuario?.id) !== Number(user.id));
      if (invalidPedido) {
        throw new Error("Se detectó un pedido que no pertenece al usuario autenticado");
      }

      setPedidos(response.data);
      setTotalPages(response.totalPages);
      setTotalItems(response.totalItems);
      setEstadosPedido(estadosPedidoData.filter((estado) => estado.esActivo));
      setEstadosEnvio(estadosEnvioData.filter((estado) => estado.esActivo));
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudieron obtener tus pedidos");
    } finally {
      setLoading(false);
    }
  }, [appliedFilters, page, pageSize, user?.id]);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      void loadPedidos();
    }
  }, [authLoading, isAuthenticated, loadPedidos]);

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

  return {
    pedidos,
    loading,
    error,
    page,
    pageSize,
    totalPages,
    totalItems,
    estadosPedido,
    estadosEnvio,
    registerFilters,
    applyFilters,
    clearFilters,
    goToPage,
    changePageSize,
    refresh: loadPedidos,
  };
}

