import apiClient, { parseApiError } from "../apiClient";
import type {
  CreatePedidoPayload,
  CreatePedidoResponse,
  EstadoEnvioOption,
  EstadoPedidoOption,
  PedidoAdmin,
  PedidoCliente,
} from "@/types/pedidos";

const getAllForAdmin = async (): Promise<PedidoAdmin[]> => {
  try {
    const { data } = await apiClient.get<PedidoAdmin[]>("/pedidos/admin/all");
    return data;
  } catch (error) {
    throw parseApiError(error, {
      fallbackMessage: "No se pudieron obtener los pedidos",
      prefix: "Pedidos",
    });
  }
};

const getById = async (id: number): Promise<PedidoAdmin> => {
  try {
    const { data } = await apiClient.get<PedidoAdmin>(`/pedidos/${id}`);
    return data;
  } catch (error) {
    throw parseApiError(error, {
      fallbackMessage: "No se pudo obtener el detalle del pedido",
      prefix: "Pedidos",
    });
  }
};

const getAllForUser = async (idUsuario: number): Promise<PedidoCliente[]> => {
  try {
    const { data } = await apiClient.get<PedidoCliente[]>(`/pedidos/usuario/${idUsuario}`);
    return data;
  } catch (error) {
    throw parseApiError(error, {
      fallbackMessage: "No se pudieron obtener tus pedidos",
      prefix: "Pedidos",
    });
  }
};

const createPedido = async (payload: CreatePedidoPayload): Promise<CreatePedidoResponse> => {
  try {
    const { data } = await apiClient.post<CreatePedidoResponse>("/pedidos", payload);
    return data;
  } catch (error) {
    throw parseApiError(error, {
      fallbackMessage: "No se pudo iniciar el pago del pedido",
      prefix: "Pedidos",
    });
  }
};

const getEstadosPedido = async (): Promise<EstadoPedidoOption[]> => {
  try {
    const { data } = await apiClient.get<EstadoPedidoOption[]>("/estados-pedidos");
    return data;
  } catch (error) {
    throw parseApiError(error, {
      fallbackMessage: "No se pudieron obtener los estados de pedido",
      prefix: "Pedidos",
    });
  }
};

const getEstadosEnvio = async (): Promise<EstadoEnvioOption[]> => {
  try {
    const { data } = await apiClient.get<EstadoEnvioOption[]>("/estados-envios");
    return data;
  } catch (error) {
    throw parseApiError(error, {
      fallbackMessage: "No se pudieron obtener los estados de envío",
      prefix: "Pedidos",
    });
  }
};

const updateEstadoPedido = async (idPedido: number, idEstadoPedido: number): Promise<PedidoAdmin> => {
  try {
    const { data } = await apiClient.put<PedidoAdmin>(`/pedidos/${idPedido}/estado-pedido`, {
      id_estado_pedido: idEstadoPedido,
    });
    return data;
  } catch (error) {
    throw parseApiError(error, {
      fallbackMessage: "No se pudo actualizar el estado del pedido",
      prefix: "Pedidos",
    });
  }
};

const updateEstadoEnvio = async (idPedido: number, idEstadoEnvio: number): Promise<PedidoAdmin> => {
  try {
    const { data } = await apiClient.put<PedidoAdmin>(`/pedidos/${idPedido}/estado-envio`, {
      id_estado_envio: idEstadoEnvio,
    });
    return data;
  } catch (error) {
    throw parseApiError(error, {
      fallbackMessage: "No se pudo actualizar el estado del envío",
      prefix: "Pedidos",
    });
  }
};

export const pedidosService = {
  getAllForAdmin,
  getAllForUser,
  getById,
  createPedido,
  getEstadosPedido,
  getEstadosEnvio,
  updateEstadoPedido,
  updateEstadoEnvio,
};
