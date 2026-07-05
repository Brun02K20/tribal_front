export type BarMetricItem = {
  label: string;
  value: number;
};

export type PieMetricItem = {
  label: string;
  value: number;
};

export type ProductSalesMetricItem = {
  id: number;
  nombre: string;
  unidadesVendidas: number;
};

export type ProductRatingMetricItem = {
  id: number;
  nombre: string;
  promedioCalificacion: number;
  totalResenas: number;
};

export type ClientOrdersMetricItem = {
  id: number;
  nombre: string;
  email: string;
  pedidos: number;
};

export type AuditRecentEventItem = {
  id: number;
  userId: number | null;
  eventType: string;
  entityType: string | null;
  entityId: number | null;
  ip: string | null;
  createdAt: string;
};

export type MetricasResponse = {
  productos: {
    topMasVendidos: ProductSalesMetricItem[];
    topMenosVendidos: ProductSalesMetricItem[];
    vendidosPorMes: BarMetricItem[];
    topMejorCalificados: ProductRatingMetricItem[];
    topPeorCalificados: ProductRatingMetricItem[];
    totalDisenos: number;
    valorTotalDisenos: number;
  };
  ventasPagos: {
    promedioGastadoTotal: number;
    maximaVenta: number;
    minimaVenta: number;
    ventasPorMesCantidad: BarMetricItem[];
    ventasPorMesMonto: BarMetricItem[];
  };
  pedidos: {
    cantidadPorEstadoPedido: PieMetricItem[];
    cantidadPorEstadoEnvio: PieMetricItem[];
    pedidosPorMes: BarMetricItem[];
  };
  clientes: {
    porcentajeConPedido: {
      conPedido: number;
      sinPedido: number;
      porcentajeConPedido: number;
      porcentajeSinPedido: number;
      totalClientes: number;
    };
    usuariosRegistradosPeriodo: number;
    topConMasPedidos: ClientOrdersMetricItem[];
  };
  auditoria: {
    totalEventos: number;
    eventosPorTipo: PieMetricItem[];
    eventosPorMes: BarMetricItem[];
    productosMasVistos: BarMetricItem[];
    busquedasFrecuentes: BarMetricItem[];
    ultimosEventos: AuditRecentEventItem[];
  };
};
