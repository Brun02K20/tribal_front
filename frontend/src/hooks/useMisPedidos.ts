"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/src/context/AuthContext";
import { pedidosService } from "@/src/services/pedidos/pedidos.service";
import type { PedidoCliente } from "@/types/pedidos";

export function useMisPedidos() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();

  const [pedidos, setPedidos] = useState<PedidoCliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPedidos = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await pedidosService.getAllForUser(user.id);
      const invalidPedido = data.find((pedido) => Number(pedido.usuario?.id) !== Number(user.id));
      if (invalidPedido) {
        throw new Error("Se detectó un pedido que no pertenece al usuario autenticado");
      }
      setPedidos(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudieron obtener tus pedidos");
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      void loadPedidos();
    }
  }, [authLoading, isAuthenticated, loadPedidos]);

  return {
    pedidos,
    loading,
    error,
    refresh: loadPedidos,
  };
}
