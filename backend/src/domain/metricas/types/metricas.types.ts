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
  userLabel: string | null;
  eventType: string;
  eventLabel: string;
  entityType: string | null;
  entityId: number | null;
  entityLabel: string | null;
  ip: string | null;
  createdAt: string;
};

export type RegisteredUserMetricItem = {
  id: number;
  nombre: string;
  telefono: string;
  fechaRegistro: string;
};

export type PaginatedMetricItems<T> = {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  data: T[];
};

export type DesignPurchaseMetricItem = {
  id: number;
  nombre: string;
  producto: string;
  urlFoto: string;
  value: number;
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
    intervalosPrecioBuscados: BarMetricItem[];
    disenosMasComprados: DesignPurchaseMetricItem[];
    eventos: PaginatedMetricItems<AuditRecentEventItem>;
    ultimosEventos: AuditRecentEventItem[];
  };
  usuariosRegistrados: PaginatedMetricItems<RegisteredUserMetricItem>;
};
