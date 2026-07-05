"use client";

import { useEffect, useState } from "react";
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
import { useMetricasAdmin } from "@/features/admin/hooks/useMetricasAdmin";
import { formatCurrencyArs } from "@/shared/lib/formatters";
import type { BarMetricItem, PieMetricItem } from "@/types/metricas";

const CHART_COLORS = [
  "var(--color-earth-brown)",
  "var(--color-earth-brown-soft)",
  "var(--color-dark-gray)",
  "var(--color-line)",
  "var(--color-black)",
];

type MetricsTab = "general" | "productos" | "ventas" | "tracking";

const METRICS_TABS: Array<{ id: MetricsTab; label: string }> = [
  { id: "general", label: "General" },
  { id: "productos", label: "Productos" },
  { id: "ventas", label: "Ventas" },
  { id: "tracking", label: "Tracking" },
];

const getColor = (index: number) => CHART_COLORS[index % CHART_COLORS.length];

const formatDateTime = (value: string) =>
  new Intl.DateTimeFormat("es-AR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));

type MetricCardProps = {
  label: string;
  value: string | number;
};

function MetricCard({ label, value }: MetricCardProps) {
  return (
    <article className="app-panel p-4">
      <p className="app-subtitle text-sm">{label}</p>
      <p className="app-title mt-2 text-2xl">{value}</p>
    </article>
  );
}

type BarChartCardProps = {
  title: string;
  data: BarMetricItem[];
};

function BarChartCard({ title, data }: BarChartCardProps) {
  return (
    <article className="app-panel p-4">
      <h3 className="app-title text-lg">{title}</h3>
      {data.length === 0 ? (
        <p className="app-subtitle mt-3 text-sm">Sin datos para mostrar.</p>
      ) : (
        <div className="mt-4 h-80 w-full">
          <ResponsiveContainer>
            <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 70 }}>
              <CartesianGrid stroke="var(--color-line)" strokeDasharray="3 3" />
              <XAxis
                dataKey="label"
                tick={{ fill: "var(--color-dark-gray)", fontSize: 12 }}
                angle={-35}
                textAnchor="end"
                height={90}
                interval={0}
              />
              <YAxis tick={{ fill: "var(--color-dark-gray)", fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  background: "var(--color-cream)",
                  border: "1px solid var(--color-line)",
                  borderRadius: "0.5rem",
                }}
              />
              <Bar dataKey="value" fill="var(--color-earth-brown)" radius={[6, 6, 0, 0]} />
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

export default function Metricas() {
  const [activeTab, setActiveTab] = useState<MetricsTab>("general");
  const {
    metricas,
    loading,
    error,
    refresh,
    months,
    setMonths,
    userPage,
    userPageSize,
    setUserPage,
    setUserPageSize,
    auditPage,
    auditPageSize,
    auditEventType,
    auditDateFrom,
    auditDateTo,
    auditUserId,
    auditEntityType,
    auditEntityId,
    setAuditPage,
    setAuditPageSize,
    setAuditEventType,
    setAuditDateFrom,
    setAuditDateTo,
    setAuditUserId,
    setAuditEntityType,
    setAuditEntityId,
  } = useMetricasAdmin();

  useEffect(() => {
    if (activeTab === "ventas") {
      setUserPage(1);
    }
    if (activeTab === "tracking") {
      setAuditPage(1);
    }
  }, [activeTab, setAuditPage, setUserPage]);

  if (loading) {
    return (
      <AdminShell title="Metricas" subtitle="Productos, ventas, pedidos, clientes y auditoria en una vista consolidada.">
        <LoadingState message="Cargando metricas..." />
      </AdminShell>
    );
  }

  if (error) {
    return (
      <AdminShell title="Metricas" subtitle="Productos, ventas, pedidos, clientes y auditoria en una vista consolidada.">
        <ErrorState message={error} />
        <button type="button" className="app-btn-primary mt-3" onClick={() => void refresh()}>
          Reintentar
        </button>
      </AdminShell>
    );
  }

  if (!metricas) {
    return (
      <AdminShell title="Metricas" subtitle="Productos, ventas, pedidos, clientes y auditoria en una vista consolidada.">
        <EmptyState message="No hay metricas disponibles." />
      </AdminShell>
    );
  }

  const usuarios = metricas.usuariosRegistrados;
  const auditEvents = metricas.auditoria.eventos;
  const topMasVendidos = metricas.productos.topMasVendidos.map((product) => ({
    label: product.nombre,
    value: product.unidadesVendidas,
  }));
  const topMenosVendidos = metricas.productos.topMenosVendidos.map((product) => ({
    label: product.nombre,
    value: product.unidadesVendidas,
  }));
  const topMejorCalificados = metricas.productos.topMejorCalificados.map((product) => ({
    label: product.nombre,
    value: Number(product.promedioCalificacion.toFixed(2)),
  }));
  const topPeorCalificados = metricas.productos.topPeorCalificados.map((product) => ({
    label: product.nombre,
    value: Number(product.promedioCalificacion.toFixed(2)),
  }));
  const topClientesConMasPedidos = metricas.clientes.topConMasPedidos.map((client) => ({
    label: client.nombre || client.email,
    value: client.pedidos,
  }));
  const clientesConPedido = [
    { label: "Con pedido", value: metricas.clientes.porcentajeConPedido.conPedido },
    { label: "Sin pedido", value: metricas.clientes.porcentajeConPedido.sinPedido },
  ];

  return (
    <AdminShell title="Metricas" subtitle="Productos, ventas, pedidos, clientes y auditoria en una vista consolidada.">
      <section className="mb-4 flex flex-wrap items-center justify-end gap-2">
        <label htmlFor="metricas-months" className="text-sm text-dark-gray">
          Rango:
        </label>
        <select
          id="metricas-months"
          className="app-input max-w-40"
          value={months}
          onChange={(event) => {
            setUserPage(1);
            setAuditPage(1);
            setMonths(Number(event.target.value) as 1 | 3 | 6 | 12);
          }}
        >
          <option value={1}>1 mes</option>
          <option value={3}>3 meses</option>
          <option value={6}>6 meses</option>
          <option value={12}>12 meses</option>
        </select>
      </section>

      <nav className="mb-6 flex flex-wrap gap-2 border-b border-line pb-2" aria-label="Secciones de metricas">
        {METRICS_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={activeTab === tab.id ? "app-btn-primary text-sm" : "app-btn-secondary text-sm"}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {activeTab === "general" && (
        <section className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          <MetricCard label="Promedio gastado en total" value={formatCurrencyArs(metricas.ventasPagos.promedioGastadoTotal)} />
          <MetricCard label="Maxima venta" value={formatCurrencyArs(metricas.ventasPagos.maximaVenta)} />
          <MetricCard label="Minima venta" value={formatCurrencyArs(metricas.ventasPagos.minimaVenta)} />
          <MetricCard label="Usuarios registrados en periodo" value={metricas.clientes.usuariosRegistradosPeriodo} />
          <MetricCard label="Total de disenos en el sistema" value={metricas.productos.totalDisenos} />
          <MetricCard label="Valor total de disenos" value={formatCurrencyArs(metricas.productos.valorTotalDisenos)} />
          <MetricCard label="Eventos de auditoria" value={metricas.auditoria.totalEventos} />
        </section>
      )}

      {activeTab === "productos" && (
        <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <BarChartCard title="Productos mas vendidos (Top 10)" data={topMasVendidos} />
          <BarChartCard title="Productos menos vendidos (Top 10)" data={topMenosVendidos} />
          <BarChartCard title="Productos vendidos por mes" data={metricas.productos.vendidosPorMes} />
          <BarChartCard title="Productos mejor calificados (Top 10)" data={topMejorCalificados} />
          <BarChartCard title="Productos peor calificados (Top 10)" data={topPeorCalificados} />
        </section>
      )}

      {activeTab === "ventas" && (
        <>
          <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <BarChartCard title="Ventas por mes (cantidad)" data={metricas.ventasPagos.ventasPorMesCantidad} />
            <BarChartCard title="Ventas por mes (monto)" data={metricas.ventasPagos.ventasPorMesMonto} />
            <BarChartCard title="Pedidos realizados por mes" data={metricas.pedidos.pedidosPorMes} />
            <BarChartCard title="Clientes con mas pedidos (Top 10)" data={topClientesConMasPedidos} />
            <PieChartCard title="Clientes con al menos un pedido" data={clientesConPedido} />
            <PieChartCard title="Pedidos por estado de pedido" data={metricas.pedidos.cantidadPorEstadoPedido} />
            <PieChartCard title="Pedidos por estado de envio" data={metricas.pedidos.cantidadPorEstadoEnvio} />
          </section>

          <section className="app-panel mt-6 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="app-title text-lg">Usuarios registrados</h3>
              <select
                className="app-input max-w-32"
                value={userPageSize}
                onChange={(event) => {
                  setUserPage(1);
                  setUserPageSize(Number(event.target.value));
                }}
              >
                <option value={10}>10 filas</option>
                <option value={20}>20 filas</option>
                <option value={50}>50 filas</option>
              </select>
            </div>

            {usuarios.data.length === 0 ? (
              <p className="app-subtitle mt-3 text-sm">Sin usuarios para mostrar.</p>
            ) : (
              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[680px] text-left text-sm">
                  <thead className="border-b border-line text-dark-gray">
                    <tr>
                      <th className="py-2 pr-3 font-medium">Nombre</th>
                      <th className="py-2 pr-3 font-medium">Telefono</th>
                      <th className="py-2 pr-3 font-medium">Fecha de registro</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usuarios.data.map((user) => (
                      <tr key={user.id} className="border-b border-line/70">
                        <td className="py-2 pr-3">{user.nombre || "-"}</td>
                        <td className="py-2 pr-3">{user.telefono || "-"}</td>
                        <td className="py-2 pr-3">{formatDateTime(user.fechaRegistro)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                type="button"
                className="app-btn-secondary text-sm"
                disabled={userPage <= 1}
                onClick={() => setUserPage(Math.max(1, userPage - 1))}
              >
                Anterior
              </button>
              <span className="text-sm text-dark-gray">
                Pagina {usuarios.page} de {usuarios.totalPages}
              </span>
              <button
                type="button"
                className="app-btn-secondary text-sm"
                disabled={userPage >= usuarios.totalPages}
                onClick={() => setUserPage(Math.min(usuarios.totalPages, userPage + 1))}
              >
                Siguiente
              </button>
            </div>
          </section>
        </>
      )}

      {activeTab === "tracking" && (
        <>
          <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <PieChartCard title="Eventos de auditoria por tipo" data={metricas.auditoria.eventosPorTipo} />
            <BarChartCard title="Eventos de auditoria por mes" data={metricas.auditoria.eventosPorMes} />
            <BarChartCard title="Terminos mas buscados (Top 20)" data={metricas.auditoria.busquedasFrecuentes} />
            <BarChartCard title="Intervalos de precio mas buscados" data={metricas.auditoria.intervalosPrecioBuscados} />
            <BarChartCard title="Productos mas visitados (Top 20)" data={metricas.auditoria.productosMasVistos} />
          </section>

          <section className="app-panel mt-6 p-4">
            <h3 className="app-title text-lg">Disenos mas comprados</h3>
            {metricas.auditoria.disenosMasComprados.length === 0 ? (
              <p className="app-subtitle mt-3 text-sm">Sin disenos comprados para mostrar.</p>
            ) : (
              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[720px] text-left text-sm">
                  <thead className="border-b border-line text-dark-gray">
                    <tr>
                      <th className="py-2 pr-3 font-medium">Diseno</th>
                      <th className="py-2 pr-3 font-medium">Producto</th>
                      <th className="py-2 pr-3 font-medium">Compras</th>
                      <th className="py-2 pr-3 font-medium">Foto</th>
                    </tr>
                  </thead>
                  <tbody>
                    {metricas.auditoria.disenosMasComprados.map((design) => (
                      <tr key={design.id} className="border-b border-line/70">
                        <td className="py-2 pr-3 font-medium">{design.nombre}</td>
                        <td className="py-2 pr-3">{design.producto || "-"}</td>
                        <td className="py-2 pr-3">{design.value}</td>
                        <td className="py-2 pr-3">
                          {design.urlFoto ? (
                            <a className="text-earth-brown underline" href={design.urlFoto} target="_blank" rel="noreferrer">
                              Ver foto
                            </a>
                          ) : (
                            "-"
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className="app-panel mt-6 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="app-title text-lg">Todos los eventos de auditoria</h3>
              <select
                className="app-input max-w-32"
                value={auditPageSize}
                onChange={(event) => {
                  setAuditPage(1);
                  setAuditPageSize(Number(event.target.value));
                }}
              >
                <option value={10}>10 filas</option>
                <option value={20}>20 filas</option>
                <option value={50}>50 filas</option>
              </select>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-4">
              <select
                className="app-input"
                value={auditEventType}
                onChange={(event) => {
                  setAuditPage(1);
                  setAuditEventType(event.target.value);
                }}
              >
                <option value="">Todos los eventos</option>
                <option value="PAGE_VISITED">Visitas a pagina</option>
                <option value="USER_REGISTERED">Usuarios registrados</option>
                <option value="USER_LOGIN">Inicios de sesion</option>
                <option value="PRODUCT_VIEWED">Productos visitados</option>
                <option value="PRODUCT_SEARCHED">Busquedas de productos</option>
                <option value="CHECKOUT_STARTED">Checkouts iniciados</option>
                <option value="PAYMENT_STARTED">Pagos iniciados</option>
                <option value="PAYMENT_APPROVED">Pagos aprobados</option>
                <option value="ADDRESS_CREATED">Direcciones creadas</option>
                <option value="ACCOUNT_UPDATED">Cuentas actualizadas</option>
              </select>

              <input
                className="app-input"
                type="date"
                value={auditDateFrom}
                onChange={(event) => {
                  setAuditPage(1);
                  setAuditDateFrom(event.target.value);
                }}
              />

              <input
                className="app-input"
                type="date"
                value={auditDateTo}
                onChange={(event) => {
                  setAuditPage(1);
                  setAuditDateTo(event.target.value);
                }}
              />

              <input
                className="app-input"
                inputMode="numeric"
                placeholder="ID usuario"
                value={auditUserId}
                onChange={(event) => {
                  setAuditPage(1);
                  setAuditUserId(event.target.value.replace(/\D/g, ""));
                }}
              />

              <select
                className="app-input"
                value={auditEntityType}
                onChange={(event) => {
                  setAuditPage(1);
                  setAuditEntityType(event.target.value);
                }}
              >
                <option value="">Todas las entidades</option>
                <option value="PAGE">Pagina</option>
                <option value="USER">Usuario</option>
                <option value="PRODUCT">Producto</option>
                <option value="PEDIDO">Pedido</option>
                <option value="ENCARGO">Encargo</option>
                <option value="ADDRESS">Direccion</option>
                <option value="CHECKOUT">Checkout</option>
                <option value="PAYMENT_PREFERENCE">Preferencia de pago</option>
              </select>

              <input
                className="app-input"
                inputMode="numeric"
                placeholder="ID entidad"
                value={auditEntityId}
                onChange={(event) => {
                  setAuditPage(1);
                  setAuditEntityId(event.target.value.replace(/\D/g, ""));
                }}
              />

              <button
                type="button"
                className="app-btn-secondary"
                onClick={() => {
                  setAuditPage(1);
                  setAuditEventType("");
                  setAuditDateFrom("");
                  setAuditDateTo("");
                  setAuditUserId("");
                  setAuditEntityType("");
                  setAuditEntityId("");
                }}
              >
                Limpiar filtros
              </button>
            </div>

            {auditEvents.data.length === 0 ? (
              <p className="app-subtitle mt-3 text-sm">Sin eventos para mostrar.</p>
            ) : (
              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[760px] text-left text-sm">
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
                    {auditEvents.data.map((event) => (
                      <tr key={event.id} className="border-b border-line/70">
                        <td className="py-2 pr-3">{formatDateTime(event.createdAt)}</td>
                        <td className="py-2 pr-3 font-medium">{event.eventLabel}</td>
                        <td className="py-2 pr-3">{event.userLabel ?? "-"}</td>
                        <td className="py-2 pr-3">{event.entityLabel ?? "-"}</td>
                        <td className="py-2 pr-3">{event.ip ?? "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                type="button"
                className="app-btn-secondary text-sm"
                disabled={auditPage <= 1}
                onClick={() => setAuditPage(Math.max(1, auditPage - 1))}
              >
                Anterior
              </button>
              <span className="text-sm text-dark-gray">
                Pagina {auditEvents.page} de {auditEvents.totalPages}
              </span>
              <button
                type="button"
                className="app-btn-secondary text-sm"
                disabled={auditPage >= auditEvents.totalPages}
                onClick={() => setAuditPage(Math.min(auditEvents.totalPages, auditPage + 1))}
              >
                Siguiente
              </button>
            </div>
          </section>
        </>
      )}
    </AdminShell>
  );
}
