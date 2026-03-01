"use client";

import { usePedidoDetail } from "@/features/pedidos/hooks/usePedidoDetail";

export function usePedidoAdminDetail(id: number) {
  return usePedidoDetail({ id });
}

