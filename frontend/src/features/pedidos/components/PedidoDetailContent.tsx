import type { PedidoAdmin } from "@/types/pedidos";
import { formatCurrencyArs, formatDateTimeEsAr } from "@/shared/lib/formatters";
import { formatProductSize } from "@/shared/lib/pedidos";

type PedidoDetailContentProps = {
  pedido: PedidoAdmin;
};

export default function PedidoDetailContent({ pedido }: PedidoDetailContentProps) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="app-panel p-4">
          <h3 className="app-title text-lg">Cliente</h3>
          <p className="app-subtitle mt-2">Nombre: {pedido.usuario?.nombre || "-"}</p>
          <p className="app-subtitle">Mail: {pedido.usuario?.email || "-"}</p>
          <p className="app-subtitle">Teléfono: {pedido.usuario?.telefono || "-"}</p>
        </div>

        <div className="app-panel p-4">
          <h3 className="app-title text-lg">Fechas y pago</h3>
          <p className="app-subtitle mt-2">Pedido: {formatDateTimeEsAr(pedido.fecha_pedido)}</p>
          <p className="app-subtitle">Pago: {formatDateTimeEsAr(pedido.pago?.fecha_pago || "")}</p>
          <p className="app-subtitle">Estado del pedido: {pedido.estado_pedido?.nombre || "-"}</p>
          <p className="app-subtitle">Monto pagado: {formatCurrencyArs(pedido.pago?.monto_total || 0)}</p>
          <p className="app-subtitle">Aprobado: {pedido.pago?.aprobado ? "Sí" : "No"}</p>
        </div>
      </div>

      <div className="app-panel p-4">
        <h3 className="app-title text-lg">Entrega</h3>
        <p className="app-subtitle mt-2">
          Dirección: {pedido.envio?.direccion?.calle || "-"} {pedido.envio?.direccion?.altura || ""}, {pedido.envio?.direccion?.provincia?.nombre || "-"}, {pedido.envio?.direccion?.ciudad?.nombre || "-"}
        </p>
        <p className="app-subtitle">CP: {pedido.envio?.direccion?.cod_postal_destino || "-"}</p>
        <p className="app-subtitle">Estado de envío: {pedido.envio?.estado_envio?.nombre || "-"}</p>
        <p className="app-subtitle">Observaciones: {pedido.observaciones?.trim() || "-"}</p>
        <p className="app-subtitle">
          Tamaño sugerido de paquete: {pedido.envio?.ancho_paquete || 0} x {pedido.envio?.alto_paquete || 0} x {pedido.envio?.profundo_paquete || 0} cm
        </p>
      </div>

      <div className="app-panel p-4">
        <h3 className="app-title text-lg">Productos comprados</h3>
        {pedido.detalles?.length ? (
          <p className="app-subtitle mt-2">
            {pedido.detalles.filter((item) => Number(item.porcentaje_descuento ?? 0) > 0).length} de {pedido.detalles.length} productos con descuento aplicado.
          </p>
        ) : null}
        {!pedido.detalles?.length ? (
          <p className="app-subtitle mt-2">No hay productos asociados a este pedido.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-225 border-collapse overflow-hidden rounded-lg">
              <thead>
                <tr className="bg-earth-brown text-cream">
                  <th className="px-3 py-2 text-left">Producto</th>
                  <th className="px-3 py-2 text-left">Categoría</th>
                  <th className="px-3 py-2 text-left">Subcategoría</th>
                  <th className="px-3 py-2 text-left">Descuento</th>
                  <th className="px-3 py-2 text-left">Unidades</th>
                  <th className="px-3 py-2 text-left">Precio unitario</th>
                  <th className="px-3 py-2 text-left">Subtotal</th>
                  <th className="px-3 py-2 text-left">Tamaño producto</th>
                </tr>
              </thead>
              <tbody>
                {pedido.detalles.map((item) => (
                  <tr key={item.id} className="border-t border-line">
                    <td className="px-3 py-2">{item.nombre_producto || "-"}</td>
                    <td className="px-3 py-2">{item.categoria?.nombre || "-"}</td>
                    <td className="px-3 py-2">{item.subcategoria?.nombre || "-"}</td>
                    <td className="px-3 py-2">
                      {Number(item.porcentaje_descuento ?? 0) > 0 ? (
                        <span
                          className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-800"
                          title={`Descuento aplicado (${item.porcentaje_descuento}%)`}
                        >
                          {item.porcentaje_descuento}% OFF
                        </span>
                      ) : (
                        <span className="text-dark-gray">Sin descuento</span>
                      )}
                    </td>
                    <td className="px-3 py-2">{item.unidades}</td>
                    <td className="px-3 py-2">{formatCurrencyArs(item.precio_unitario)}</td>
                    <td className="px-3 py-2">{formatCurrencyArs(item.subtotal)}</td>
                    <td className="px-3 py-2">{formatProductSize(item)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="app-panel p-4">
        <h3 className="app-title text-lg">Resumen de costos</h3>
        <p className="app-subtitle mt-2">Productos: {formatCurrencyArs(pedido.costo_total_productos)}</p>
        <p className="app-subtitle">Envío: {formatCurrencyArs(pedido.costo_envio)}</p>
        <p className="app-subtitle">Gestión envío: {formatCurrencyArs(pedido.costo_ganancia_envio)}</p>
        <p className="app-subtitle">
          Total (suma de 3 costos): {formatCurrencyArs(
            Number(pedido.costo_total_productos || 0)
              + Number(pedido.costo_envio || 0)
              + Number(pedido.costo_ganancia_envio || 0),
          )}
        </p>
      </div>
    </div>
  );
}

