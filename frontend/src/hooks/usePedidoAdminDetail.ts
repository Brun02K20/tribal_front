"use client";

import { usePedidoDetail } from "@/src/hooks/usePedidoDetail";

export function usePedidoAdminDetail(id: number) {
  return usePedidoDetail({ id });
}
