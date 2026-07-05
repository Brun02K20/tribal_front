"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import AdminShell from "@/features/admin/components/AdminShell";
import LoadingState from "@/shared/ui/LoadingState";
import ErrorState from "@/shared/ui/ErrorState";
import EmptyState from "@/shared/ui/EmptyState";
import { formatCurrencyArs } from "@/shared/lib/formatters";
import { useMetricasAdmin } from "@/features/admin/hooks/useMetricasAdmin";
import type { BarMetricItem, PieMetricItem } from "@/types/metricas";

const CHART_COLORS = [
  "var(--color-earth-brown)",
  "var(--color-earth-brown-soft)",
  "var(--color-dark-gray)",
  "var(--color-line)",
  "var(--color-black)",
];

const getColor = (index: number) => CHART_COLORS[index % CHART_COLORS.length];

type BarChartCardProps = {
  title: string;
  data: BarMetricItem[];
  dataKey?: string;
};

function BarChartCard({ title, data, dataKey = "value" }: BarChartCardProps) {
  return (
    <article className="app-panel p-4">
      <h3 className="app-title text-lg">{title}</h3>
      {data.length === 0 ? (
        <p className="app-subtitle mt-3 text-sm">Sin datos para mostrar.</p>
      ) : (
        <div className="mt-4 h-80 w-full">
          <ResponsiveContainer>
            <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 30 }}>
              <CartesianGrid stroke="var(--color-line)" strokeDasharray="3 3" />
              <XAxis
                dataKey="label"
                tick={{ fill: "var(--color-dark-gray)", fontSize: 12 }}
                angle={-30}
                textAnchor="end"
                height={60}
              />
              <YAxis tick={{ fill: "var(--color-dark-gray)", fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  background: "var(--color-cream)",
                  border: "1px solid var(--color-line)",
                  borderRadius: "0.5rem",
                }}
              />
              <Bar dataKey={dataKey} fill="var(--color-earth-brown)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </article>
  );
}

type PieChartCardProps = {
  title: string;
  data: PieMetricItem[];
};

function PieChartCard({ title, data }: PieChartCardProps) {
  return (
    <article className="app-panel p-4">
      <h3 className="app-title text-lg">{title}</h3>
      {data.length === 0 ? (
        <p className="app-subtitle mt-3 text-sm">Sin datos para mostrar.</p>
      ) : (
        <div className="mt-4 h-80 w-full">
          <ResponsiveContainer>
            <PieChart>
              <Pie data={data} dataKey="value" nameKey="label" outerRadius={110} label>
                {data.map((entry, index) => (
                  <Cell key={`${entry.label}-${index}`} fill={getColor(index)} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: "var(--color-cream)",
                  border: "1px solid var(--color-line)",
                  borderRadius: "0.5rem",
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </article>
  );
}

const formatDateTime = (value: string) =>
  new Intl.DateTimeFormat("es-AR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));

export default function Metricas() {
  const { metricas, loading, error, refresh, months, setMonths } = useMetricasAdmin();

  if (loading) {
    return (
      <AdminShell title="Metricas" subtitle="Indicadores clave del negocio.">
        <LoadingState message="Cargando metricas..." />
      </AdminShell>
    );
  }

  if (error) {
    return (
      <AdminShell title="Metricas" subtitle="Indicadores clave del negocio.">
        <ErrorState message={error} />
        <button type="button" className="app-btn-primary mt-3" onClick={() => void refresh()}>
          Reintentar
        </button>
      </AdminShell>
    );
  }

  if (!metricas) {
    return (
      <AdminShell title="Metricas" subtitle="Indicadores clave del negocio.">
        <EmptyState message="No hay metricas disponibles." />
      </AdminShell>
    );
  }

  const topMasVendidosData = metricas.productos.topMasVendidos.map((item) => ({
    label: item.nombre,
    value: item.unidadesVendidas,
  }));

  const topMenosVendidosData = metricas.productos.topMenosVendidos.map((item) => ({
    label: item.nombre,
    value: item.unidadesVendidas,
  }));

  const topClientesData = metricas.clientes.topConMasPedidos.map((item) => ({
    label: item.nombre,
    value: item.pedidos,
  }));

  const topMejorCalificadosData = metricas.productos.topMejorCalificados.map((item) => ({
    label: item.nombre,
    value: item.promedioCalificacion,
  }));

  const topPeorCalificadosData = metricas.productos.topPeorCalificados.map((item) => ({
    label: item.nombre,
    value: item.promedioCalificacion,
  }));

  const clientesConPedidoPie: PieMetricItem[] = [
    { label: "Con pedido", value: metricas.clientes.porcentajeConPedido.conPedido },
    { label: "Sin pedido", value: metricas.clientes.porcentajeConPedido.sinPedido },
  ];

  return (
    <AdminShell
      title="Metricas"
      subtitle="Productos, ventas, pedidos, clientes y auditoria en una vista consolidada."
    >
      <section className="mb-4 flex items-center justify-end gap-2">
        <label htmlFor="metricas-months" className="text-sm text-dark-gray">
          Rango:
        </label>
        <select
          id="metricas-months"
          className="app-input max-w-40"
          value={months}
          onChange={(event) => setMonths(Number(event.target.value) as 1 | 3 | 6 | 12)}
        >
          <option value={1}>1 mes</option>
          <option value={3}>3 meses</option>
          <option value={6}>6 meses</option>
          <option value={12}>12 meses</option>
        </select>
      </section>

      <section className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <article className="app-panel p-4">
          <p className="app-subtitle text-sm">Promedio gastado en total</p>
          <p className="app-title mt-2 text-2xl">{formatCurrencyArs(metricas.ventasPagos.promedioGastadoTotal)}</p>
        </article>
        <article className="app-panel p-4">
          <p className="app-subtitle text-sm">Maxima venta</p>
          <p className="app-title mt-2 text-2xl">{formatCurrencyArs(metricas.ventasPagos.maximaVenta)}</p>
        </article>
        <article className="app-panel p-4">
          <p className="app-subtitle text-sm">Minima venta</p>
          <p className="app-title mt-2 text-2xl">{formatCurrencyArs(metricas.ventasPagos.minimaVenta)}</p>
        </article>
        <article className="app-panel p-4">
          <p className="app-subtitle text-sm">Usuarios registrados en periodo</p>
          <p className="app-title mt-2 text-2xl">{metricas.clientes.usuariosRegistradosPeriodo}</p>
        </article>
        <article className="app-panel p-4">
          <p className="app-subtitle text-sm">Total de disenos en el sistema</p>
          <p className="app-title mt-2 text-2xl">{metricas.productos.totalDisenos}</p>
        </article>
        <article className="app-panel p-4">
          <p className="app-subtitle text-sm">Valor total de disenos</p>
          <p className="app-title mt-2 text-2xl">{formatCurrencyArs(metricas.productos.valorTotalDisenos)}</p>
        </article>
        <article className="app-panel p-4">
          <p className="app-subtitle text-sm">Eventos de auditoria</p>
          <p className="app-title mt-2 text-2xl">{metricas.auditoria.totalEventos}</p>
        </article>
      </section>

      <section className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-2">
        <BarChartCard title="Productos mas vendidos (Top 10)" data={topMasVendidosData} />
        <BarChartCard title="Productos menos vendidos (Top 10)" data={topMenosVendidosData} />
        <BarChartCard title="Productos vendidos por mes" data={metricas.productos.vendidosPorMes} />
        <BarChartCard title="Productos mejor calificados (Top 10)" data={topMejorCalificadosData} />
        <BarChartCard title="Productos peor calificados (Top 10)" data={topPeorCalificadosData} />
        <BarChartCard title="Ventas por mes (cantidad)" data={metricas.ventasPagos.ventasPorMesCantidad} />
        <BarChartCard title="Ventas por mes (monto)" data={metricas.ventasPagos.ventasPorMesMonto} />
        <BarChartCard title="Pedidos realizados por mes" data={metricas.pedidos.pedidosPorMes} />
        <BarChartCard title="Top 10 clientes con mas pedidos" data={topClientesData} />
        <PieChartCard title="Clientes con al menos un pedido" data={clientesConPedidoPie} />
        <PieChartCard title="Cantidad de pedidos por estado de pedido" data={metricas.pedidos.cantidadPorEstadoPedido} />
        <PieChartCard title="Cantidad de pedidos por estado de envio" data={metricas.pedidos.cantidadPorEstadoEnvio} />
        <PieChartCard title="Eventos de auditoria por tipo" data={metricas.auditoria.eventosPorTipo} />
        <BarChartCard title="Eventos de auditoria por mes" data={metricas.auditoria.eventosPorMes} />
        <BarChartCard title="Productos mas vistos (Top 10)" data={metricas.auditoria.productosMasVistos} />
        <BarChartCard title="Busquedas frecuentes (Top 10)" data={metricas.auditoria.busquedasFrecuentes} />
      </section>

      <section className="app-panel mt-6 p-4">
        <h3 className="app-title text-lg">Ultimos eventos de auditoria</h3>
        {metricas.auditoria.ultimosEventos.length === 0 ? (
          <p className="app-subtitle mt-3 text-sm">Sin eventos para mostrar.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="border-b border-line text-dark-gray">
                <tr>
                  <th className="py-2 pr-3 font-medium">Fecha</th>
                  <th className="py-2 pr-3 font-medium">Evento</th>
                  <th className="py-2 pr-3 font-medium">Usuario</th>
                  <th className="py-2 pr-3 font-medium">Entidad</th>
                  <th className="py-2 pr-3 font-medium">IP</th>
                </tr>
              </thead>
              <tbody>
                {metricas.auditoria.ultimosEventos.map((event) => (
                  <tr key={event.id} className="border-b border-line/70">
                    <td className="py-2 pr-3">{formatDateTime(event.createdAt)}</td>
                    <td className="py-2 pr-3 font-medium">{event.eventType}</td>
                    <td className="py-2 pr-3">{event.userId ?? "-"}</td>
                    <td className="py-2 pr-3">
                      {event.entityType ?? "-"} {event.entityId ? `#${event.entityId}` : ""}
                    </td>
                    <td className="py-2 pr-3">{event.ip ?? "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </AdminShell>
  );
}
