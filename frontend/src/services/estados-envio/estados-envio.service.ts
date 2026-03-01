import apiClient, { parseApiError } from "../apiClient";
import type {
  EstadoEnvio,
  EstadoEnvioCreatePayload,
  EstadoEnvioUpdatePayload,
  SuccessDeleteEstadoEnvioResponse,
} from "@/types/estados-envio";

const getAll = async (): Promise<EstadoEnvio[]> => {
  try {
    const { data } = await apiClient.get<EstadoEnvio[]>("/estados-envios");
    return data;
  } catch (error) {
    throw parseApiError(error, {
      fallbackMessage: "No se pudieron obtener los estados de envío",
      prefix: "Estados de envío",
    });
  }
};

const create = async (payload: EstadoEnvioCreatePayload): Promise<EstadoEnvio> => {
  try {
    const { data } = await apiClient.post<EstadoEnvio>("/estados-envios", payload);
    return data;
  } catch (error) {
    throw parseApiError(error, {
      fallbackMessage: "No se pudo crear el estado de envío",
      prefix: "Estados de envío",
    });
  }
};

const update = async (id: number, payload: EstadoEnvioUpdatePayload): Promise<EstadoEnvio> => {
  try {
    const { data } = await apiClient.put<EstadoEnvio>(`/estados-envios/${id}`, payload);
    return data;
  } catch (error) {
    throw parseApiError(error, {
      fallbackMessage: "No se pudo actualizar el estado de envío",
      prefix: "Estados de envío",
    });
  }
};

const toggle = async (id: number): Promise<EstadoEnvio> => {
  try {
    const { data } = await apiClient.put<EstadoEnvio>(`/estados-envios/toggle/${id}`);
    return data;
  } catch (error) {
    throw parseApiError(error, {
      fallbackMessage: "No se pudo activar/desactivar el estado de envío",
      prefix: "Estados de envío",
    });
  }
};

const remove = async (id: number): Promise<SuccessDeleteEstadoEnvioResponse> => {
  try {
    const { data } = await apiClient.delete<SuccessDeleteEstadoEnvioResponse>(`/estados-envios/${id}`);
    return data;
  } catch (error) {
    throw parseApiError(error, {
      fallbackMessage: "No se pudo borrar el estado de envío",
      prefix: "Estados de envío",
    });
  }
};

export const estadosEnvioService = {
  getAll,
  create,
  update,
  toggle,
  remove,
};
