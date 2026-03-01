"use client";

import { useEffect, useState } from "react";
import { pedidosService } from "@/src/services/pedidos/pedidos.service";
import type { PedidoAdmin } from "@/types/pedidos";

type UsePedidoDetailParams = {
  id: number;
  expectedUserId?: number;
};

export function usePedidoDetail({ id, expectedUserId }: UsePedidoDetailParams) {
  const [pedido, setPedido] = useState<PedidoAdmin | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      if (!Number.isFinite(id) || id <= 0) {
        setError("ID de pedido inválido");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const data = await pedidosService.getById(id);

        if (expectedUserId && Number(data.usuario?.id) !== Number(expectedUserId)) {
          throw new Error("No podés consultar pedidos de otro usuario");
        }

        setPedido(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "No se pudo cargar el pedido");
      } finally {
        setLoading(false);
      }
    };

    void run();
  }, [expectedUserId, id]);

  return {
    pedido,
    loading,
    error,
  };
}
