import type { PedidoAdmin, PedidoDetalleItem } from "@/types/pedidos";
import { formatCurrencyArs } from "./formatters";

export const getPedidoDireccion = (pedido: PedidoAdmin) => {
  const direccion = pedido.envio?.direccion;
  if (!direccion) {
    return "-";
  }

  return `${direccion.calle} ${direccion.altura}, ${direccion.provincia?.nombre || "-"}, ${direccion.ciudad?.nombre || "-"}`;
};

export const getPedidoTotal = (pedido: PedidoAdmin) => {
  const total = Number(pedido.costo_total_productos || 0)
    + Number(pedido.costo_envio || 0)
    + Number(pedido.costo_ganancia_envio || 0);

  return formatCurrencyArs(total);
};

export const formatProductSize = (item: PedidoDetalleItem) =>
  `${item.ancho_producto} x ${item.alto_producto} x ${item.profundo_producto} cm`;
