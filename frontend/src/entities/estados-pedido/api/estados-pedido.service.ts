import apiClient, { parseApiError } from "@/shared/api/apiClient";
import type {
  EstadoPedido,
  EstadoPedidoCreatePayload,
  EstadoPedidoUpdatePayload,
  SuccessDeleteEstadoPedidoResponse,
} from "@/types/estados-pedido";

const getAll = async (): Promise<EstadoPedido[]> => {
  try {
    const { data } = await apiClient.get<EstadoPedido[]>("/estados-pedidos");
    return data;
  } catch (error) {
    throw parseApiError(error, {
      fallbackMessage: "No se pudieron obtener los estados de pedido",
      prefix: "Estados de pedido",
    });
  }
};

const create = async (payload: EstadoPedidoCreatePayload): Promise<EstadoPedido> => {
  try {
    const { data } = await apiClient.post<EstadoPedido>("/estados-pedidos", payload);
    return data;
  } catch (error) {
    throw parseApiError(error, {
      fallbackMessage: "No se pudo crear el estado de pedido",
      prefix: "Estados de pedido",
    });
  }
};

const update = async (id: number, payload: EstadoPedidoUpdatePayload): Promise<EstadoPedido> => {
  try {
    const { data } = await apiClient.put<EstadoPedido>(`/estados-pedidos/${id}`, payload);
    return data;
  } catch (error) {
    throw parseApiError(error, {
      fallbackMessage: "No se pudo actualizar el estado de pedido",
      prefix: "Estados de pedido",
    });
  }
};

const toggle = async (id: number): Promise<EstadoPedido> => {
  try {
    const { data } = await apiClient.put<EstadoPedido>(`/estados-pedidos/toggle/${id}`);
    return data;
  } catch (error) {
    throw parseApiError(error, {
      fallbackMessage: "No se pudo activar/desactivar el estado de pedido",
      prefix: "Estados de pedido",
    });
  }
};

const remove = async (id: number): Promise<SuccessDeleteEstadoPedidoResponse> => {
  try {
    const { data } = await apiClient.delete<SuccessDeleteEstadoPedidoResponse>(`/estados-pedidos/${id}`);
    return data;
  } catch (error) {
    throw parseApiError(error, {
      fallbackMessage: "No se pudo borrar el estado de pedido",
      prefix: "Estados de pedido",
    });
  }
};

export const estadosPedidoService = {
  getAll,
  create,
  update,
  toggle,
  remove,
};
