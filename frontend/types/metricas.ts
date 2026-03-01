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

export type ClientOrdersMetricItem = {
  id: number;
  nombre: string;
  email: string;
  pedidos: number;
};

export type MetricasResponse = {
  productos: {
    topMasVendidos: ProductSalesMetricItem[];
    topMenosVendidos: ProductSalesMetricItem[];
    vendidosPorMes: BarMetricItem[];
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
    topConMasPedidos: ClientOrdersMetricItem[];
  };
};
