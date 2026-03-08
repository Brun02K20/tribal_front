import apiClient, { parseApiError } from "@/shared/api/apiClient";
import type {
  CreateUpdateDescuentoPayload,
  Descuento,
  DescuentoFilters,
  SuccessDeleteDescuentoResponse,
} from "@/types/descuentos";

const buildFiltersParams = (filters?: DescuentoFilters) => {
  const searchParams = new URLSearchParams();

  if (!filters) {
    return searchParams;
  }

  if (filters.tipo) {
    searchParams.set("tipo", filters.tipo);
  }

  if (filters.estado) {
    searchParams.set("estado", filters.estado);
  }

  return searchParams;
};

const getAll = async (filters?: DescuentoFilters): Promise<Descuento[]> => {
  try {
    const params = buildFiltersParams(filters);
    const { data } = await apiClient.get<Descuento[]>("/descuentos", { params });
    return data;
  } catch (error) {
    throw parseApiError(error, {
      fallbackMessage: "No se pudieron obtener los descuentos",
      prefix: "Descuentos",
    });
  }
};

const getById = async (id: number): Promise<Descuento> => {
  try {
    const { data } = await apiClient.get<Descuento>(`/descuentos/${id}`);
    return data;
  } catch (error) {
    throw parseApiError(error, {
      fallbackMessage: "No se pudo obtener el descuento",
      prefix: "Descuentos",
    });
  }
};

const create = async (payload: CreateUpdateDescuentoPayload): Promise<Descuento> => {
  try {
    const { data } = await apiClient.post<Descuento>("/descuentos", payload);
    return data;
  } catch (error) {
    throw parseApiError(error, {
      fallbackMessage: "No se pudo crear el descuento",
      prefix: "Descuentos",
    });
  }
};

const update = async (id: number, payload: CreateUpdateDescuentoPayload): Promise<Descuento> => {
  try {
    const { data } = await apiClient.put<Descuento>(`/descuentos/${id}`, payload);
    return data;
  } catch (error) {
    throw parseApiError(error, {
      fallbackMessage: "No se pudo actualizar el descuento",
      prefix: "Descuentos",
    });
  }
};

const remove = async (id: number): Promise<SuccessDeleteDescuentoResponse> => {
  try {
    const { data } = await apiClient.delete<SuccessDeleteDescuentoResponse>(`/descuentos/${id}`);
    return data;
  } catch (error) {
    throw parseApiError(error, {
      fallbackMessage: "No se pudo eliminar el descuento",
      prefix: "Descuentos",
    });
  }
};

export const descuentosService = {
  getAll,
  getById,
  create,
  update,
  remove,
};
