import apiClient, { parseApiError } from "../apiClient";
import type {
  CreatePedidoPayload,
  CreatePedidoResponse,
  EstadoEnvioOption,
  EstadoPedidoOption,
  PaginatedPedidosResponse,
  PedidoFilters,
  PedidoAdmin,
  PedidoCliente,
} from "@/types/pedidos";

const buildPedidoFiltersParams = (params: {
  filters?: PedidoFilters;
  page?: number;
  pageSize?: number;
}) => {
  const searchParams = new URLSearchParams();
  const filters = params.filters;

  if (params.page && params.page > 0) {
    searchParams.set("page", String(params.page));
  }

  if (params.pageSize && params.pageSize > 0) {
    searchParams.set("pageSize", String(params.pageSize));
  }

  if (!filters) {
    return searchParams;
  }

  if (filters.id_usuario && filters.id_usuario > 0) {
    searchParams.set("id_usuario", String(filters.id_usuario));
  }

  if (filters.nombre_usuario?.trim()) {
    searchParams.set("nombre_usuario", filters.nombre_usuario.trim());
  }

  if (filters.email_usuario?.trim()) {
    searchParams.set("email_usuario", filters.email_usuario.trim());
  }

  if (filters.fecha_pedido_min) {
    searchParams.set("fecha_pedido_min", filters.fecha_pedido_min);
  }

  if (filters.fecha_pedido_max) {
    searchParams.set("fecha_pedido_max", filters.fecha_pedido_max);
  }

  if (typeof filters.id_estado_pedido === "number" && filters.id_estado_pedido > 0) {
    searchParams.set("id_estado_pedido", String(filters.id_estado_pedido));
  }

  if (typeof filters.id_estado_envio === "number" && filters.id_estado_envio > 0) {
    searchParams.set("id_estado_envio", String(filters.id_estado_envio));
  }

  return searchParams;
};

const getAllForAdmin = async (page = 1, pageSize = 10): Promise<PaginatedPedidosResponse> => {
  try {
    const { data } = await apiClient.get<PaginatedPedidosResponse>("/pedidos/admin/all", {
      params: { page, pageSize },
    });
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

const getAllForUser = async (idUsuario: number, page = 1, pageSize = 10): Promise<PaginatedPedidosResponse> => {
  try {
    const { data } = await apiClient.get<PaginatedPedidosResponse>(`/pedidos/usuario/${idUsuario}`, {
      params: { page, pageSize },
    });
    return data;
  } catch (error) {
    throw parseApiError(error, {
      fallbackMessage: "No se pudieron obtener tus pedidos",
      prefix: "Pedidos",
    });
  }
};

const findByFilters = async (
  filters: PedidoFilters,
  page = 1,
  pageSize = 10,
): Promise<PaginatedPedidosResponse> => {
  try {
    const params = buildPedidoFiltersParams({ filters, page, pageSize });
    const { data } = await apiClient.get<PaginatedPedidosResponse>("/pedidos/filters", {
      params,
    });
    return data;
  } catch (error) {
    throw parseApiError(error, {
      fallbackMessage: "No se pudieron filtrar los pedidos",
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
  findByFilters,
  getById,
  createPedido,
  getEstadosPedido,
  getEstadosEnvio,
  updateEstadoPedido,
  updateEstadoEnvio,
};
