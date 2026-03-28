"use client";

import { useParams } from "next/navigation";
import { usePedidoAdminDetail } from "@/features/admin/hooks/usePedidoAdminDetail";

export const usePedidoDetalleAdminPage = () => {
  const params = useParams<{ id: string }>();
  const id = Number(params?.id);
  const detail = usePedidoAdminDetail(id);

  return {
    id,
    ...detail,
  };
};
