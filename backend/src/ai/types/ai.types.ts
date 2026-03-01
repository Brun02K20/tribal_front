export type AiSummaryItem = string;

export type AiAdminSummaryResponse = {
  ocurrio: AiSummaryItem[];
  acciones: AiSummaryItem[];
  generadoEn: string;
  rangoDias: number;
};

export type AdminAiContextSnapshot = {
  generadoEn: string;
  fechaDesde: string;
  limitacionesDatos: {
    usuariosTieneFechaRegistro: boolean;
    pedidosTieneFechaModificacion: boolean;
  };
  resumen: {
    totalPedidosUltimosDias: number;
    totalPagosAprobadosUltimosDias: number;
    montoPagosAprobadosUltimosDias: number;
    totalProductosStockBajo: number;
    totalNuevosClientesUltimosDias: number | null;
    totalPedidosConEstadoActualizadoUltimosDias: number | null;
  };
  pedidosNuevos: Array<{
    id: number;
    fechaPedido: string;
    estadoPedido: string;
    clienteNombre: string;
    clienteEmail: string;
    clienteTelefono: string;
    montoEstimado: number;
  }>;
  pedidosPorEstado: Array<{
    estado: string;
    cantidad: number;
  }>;
  productosStockBajo: Array<{
    id: number;
    nombre: string;
    stock: number;
  }>;
  clientesNuevos: Array<{
    nombre: string;
    email: string;
    telefono: string;
    fechaRegistro: string;
  }>;
  pedidosConEstadoActualizado: Array<{
    id: number;
    fechaModificacion: string;
    estadoPedido: string;
    clienteNombre: string;
    clienteEmail: string;
    clienteTelefono: string;
  }>;
};
