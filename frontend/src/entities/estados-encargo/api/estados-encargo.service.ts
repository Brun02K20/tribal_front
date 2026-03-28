import apiClient, { parseApiError } from "@/shared/api/apiClient";
import type {
  EstadoEncargo,
  EstadoEncargoCreatePayload,
  EstadoEncargoUpdatePayload,
  SuccessDeleteEstadoEncargoResponse,
} from "@/types/estados-encargo";

const getAll = async (): Promise<EstadoEncargo[]> => {
  try {
    const { data } = await apiClient.get<EstadoEncargo[]>("/estados-encargos");
    return data;
  } catch (error) {
    throw parseApiError(error, {
      fallbackMessage: "No se pudieron obtener los estados de encargo",
      prefix: "Estados de encargo",
    });
  }
};

const create = async (payload: EstadoEncargoCreatePayload): Promise<EstadoEncargo> => {
  try {
    const { data } = await apiClient.post<EstadoEncargo>("/estados-encargos", payload);
    return data;
  } catch (error) {
    throw parseApiError(error, {
      fallbackMessage: "No se pudo crear el estado de encargo",
      prefix: "Estados de encargo",
    });
  }
};

const update = async (id: number, payload: EstadoEncargoUpdatePayload): Promise<EstadoEncargo> => {
  try {
    const { data } = await apiClient.put<EstadoEncargo>(`/estados-encargos/${id}`, payload);
    return data;
  } catch (error) {
    throw parseApiError(error, {
      fallbackMessage: "No se pudo actualizar el estado de encargo",
      prefix: "Estados de encargo",
    });
  }
};

const toggle = async (id: number): Promise<EstadoEncargo> => {
  try {
    const { data } = await apiClient.put<EstadoEncargo>(`/estados-encargos/toggle/${id}`);
    return data;
  } catch (error) {
    throw parseApiError(error, {
      fallbackMessage: "No se pudo activar/desactivar el estado de encargo",
      prefix: "Estados de encargo",
    });
  }
};

const remove = async (id: number): Promise<SuccessDeleteEstadoEncargoResponse> => {
  try {
    const { data } = await apiClient.delete<SuccessDeleteEstadoEncargoResponse>(`/estados-encargos/${id}`);
    return data;
  } catch (error) {
    throw parseApiError(error, {
      fallbackMessage: "No se pudo borrar el estado de encargo",
      prefix: "Estados de encargo",
    });
  }
};

export const estadosEncargoService = {
  getAll,
  create,
  update,
  toggle,
  remove,
};
