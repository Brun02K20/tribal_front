"use client";

import { useParams } from "next/navigation";
import { useAuth } from "@/shared/providers/AuthContext";
import { usePedidoDetail } from "@/features/pedidos/hooks/usePedidoDetail";

export const useMiPedidoDetallePage = () => {
  const { user } = useAuth();
  const params = useParams<{ id: string }>();
  const id = Number(params?.id);

  const detail = usePedidoDetail({
    id,
    expectedUserId: user?.id,
  });

  return {
    id,
    ...detail,
  };
};
