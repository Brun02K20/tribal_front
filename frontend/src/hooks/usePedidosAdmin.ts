"use client";

import { useEffect, useState } from "react";
import { pedidosService } from "@/src/services/pedidos/pedidos.service";
import { useToast } from "@/src/context/ToastContext";
import type { PedidoEstadoMode } from "@/types/admin-ui";
import type { EstadoEnvioOption, EstadoPedidoOption, PedidoAdmin } from "@/types/pedidos";

export function usePedidosAdmin() {
  const { showToast } = useToast();
  const [pedidos, setPedidos] = useState<PedidoAdmin[]>([]);
  const [estadosPedido, setEstadosPedido] = useState<EstadoPedidoOption[]>([]);
  const [estadosEnvio, setEstadosEnvio] = useState<EstadoEnvioOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPedido, setSelectedPedido] = useState<PedidoAdmin | null>(null);
  const [editEstadoMode, setEditEstadoMode] = useState<PedidoEstadoMode | null>(null);
  const [isEstadoModalOpen, setIsEstadoModalOpen] = useState(false);

  const loadAll = async () => {
    setLoading(true);
    setError(null);

    try {
      const [pedidosData, estadosPedidoData, estadosEnvioData] = await Promise.all([
        pedidosService.getAllForAdmin(),
        pedidosService.getEstadosPedido(),
        pedidosService.getEstadosEnvio(),
      ]);

      setPedidos(pedidosData);
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
  }, []);

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
    currentEstadoId,
    currentOptions,
    openPedidoEstadoModal,
    openEnvioEstadoModal,
    closeEstadoModal,
    saveEstado,
  };
}
