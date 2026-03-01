export type EstadoPedido = {
  id: number;
  nombre: string;
  esActivo: boolean;
};

export type EstadoPedidoFormValues = {
  nombre: string;
};

export type EstadoPedidoCreatePayload = {
  nombre: string;
};

export type EstadoPedidoUpdatePayload = {
  nombre: string;
};

export type SuccessDeleteEstadoPedidoResponse = {
  id: number;
  message: string;
};
