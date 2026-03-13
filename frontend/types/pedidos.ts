export type PedidoDetalleItem = {
  id: number;
  id_producto: number;
  id_descuento: number | null;
  porcentaje_descuento: number | null;
  nombre_producto: string;
  unidades: number;
  subtotal: number;
  precio_unitario: number;
  ancho_producto: number;
  alto_producto: number;
  profundo_producto: number;
  categoria: {
    id: number;
    nombre: string;
  } | null;
  subcategoria: {
    id: number;
    nombre: string;
  } | null;
};

export type PedidoAdmin = {
  id: number;
  fecha_pedido: string;
  observaciones: string | null;
  costo_total_productos: number;
  costo_envio: number;
  costo_ganancia_envio: number;
  usuario: {
    id: number;
    nombre: string;
    email: string;
    telefono: string;
  };
  pago: {
    id: number;
    monto_total: number;
    fecha_pago: string;
    aprobado: boolean;
  };
  envio: {
    id: number;
    ancho_paquete: number;
    alto_paquete: number;
    profundo_paquete: number;
    estado_envio: {
      id: number;
      nombre: string;
    };
    direccion: {
      provincia: {
        nombre: string;
      };
      ciudad: {
        nombre: string;
      };
      calle: string;
      altura: string;
      cod_postal_destino: string;
    };
  };
  detalles?: PedidoDetalleItem[];
  estado_pedido: {
    id: number;
    nombre: string;
  };
};

export type EstadoPedidoOption = {
  id: number;
  nombre: string;
  esActivo: boolean;
};

export type EstadoEnvioOption = {
  id: number;
  nombre: string;
  esActivo: boolean;
};

export type PedidoDetalleCreateInput = {
  id_producto: number;
  id_descuento?: number | null;
  unidades: number;
  subtotal: number;
  ancho_producto: number;
  alto_producto: number;
  profundo_producto: number;
};

export type CreatePedidoPayload = {
  id_usuario: number;
  costo_total_productos: number;
  costo_envio: number;
  costo_ganancia_envio: number;
  observaciones?: string | null;
  detalles: PedidoDetalleCreateInput[];
  id_direccion: number;
};

export type CreatePedidoResponse = {
  init_point: string;
};

export type PedidoCliente = PedidoAdmin;

export type PedidoFilters = {
  id_usuario?: number;
  nombre_usuario?: string;
  email_usuario?: string;
  fecha_pedido_min?: string;
  fecha_pedido_max?: string;
  id_estado_pedido?: number;
  id_estado_envio?: number;
};

export type PedidosPagination = {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
};

export type PaginatedPedidosResponse = PedidosPagination & {
  data: PedidoAdmin[];
};
