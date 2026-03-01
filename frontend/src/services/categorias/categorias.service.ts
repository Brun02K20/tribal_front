import apiClient, { parseApiError } from "../apiClient";
import type {
  CategoriaCreatePayload,
  CategoriaUpdatePayload,
  CategoriaWithSubcategorias,
  SuccessDeleteCategoriaResponse,
} from "@/types/categorias";

const getAll = async (): Promise<CategoriaWithSubcategorias[]> => {
  try {
    const { data } = await apiClient.get<CategoriaWithSubcategorias[]>("/categorias");
    return data;
  } catch (error) {
    throw parseApiError(error, {
      fallbackMessage: "No se pudieron obtener las categorías",
      prefix: "Categorías",
    });
  }
};

const getById = async (id: number): Promise<CategoriaWithSubcategorias> => {
  try {
    const { data } = await apiClient.get<CategoriaWithSubcategorias>(`/categorias/${id}`);
    return data;
  } catch (error) {
    throw parseApiError(error, {
      fallbackMessage: "No se pudo obtener la categoría",
      prefix: "Categorías",
    });
  }
};

const create = async (payload: CategoriaCreatePayload): Promise<CategoriaWithSubcategorias> => {
  try {
    const { data } = await apiClient.post<CategoriaWithSubcategorias>("/categorias", payload);
    return data;
  } catch (error) {
    throw parseApiError(error, {
      fallbackMessage: "No se pudo crear la categoría",
      prefix: "Categorías",
    });
  }
};

const update = async (id: number, payload: CategoriaUpdatePayload): Promise<CategoriaWithSubcategorias> => {
  try {
    const { data } = await apiClient.put<CategoriaWithSubcategorias>(`/categorias/${id}`, payload);
    return data;
  } catch (error) {
    throw parseApiError(error, {
      fallbackMessage: "No se pudo actualizar la categoría",
      prefix: "Categorías",
    });
  }
};

const toggle = async (id: number): Promise<CategoriaWithSubcategorias> => {
  try {
    const { data } = await apiClient.put<CategoriaWithSubcategorias>(`/categorias/toggle/${id}`);
    return data;
  } catch (error) {
    throw parseApiError(error, {
      fallbackMessage: "No se pudo activar/desactivar la categoría",
      prefix: "Categorías",
    });
  }
};

const remove = async (id: number): Promise<SuccessDeleteCategoriaResponse> => {
  try {
    const { data } = await apiClient.delete<SuccessDeleteCategoriaResponse>(`/categorias/${id}`);
    return data;
  } catch (error) {
    throw parseApiError(error, {
      fallbackMessage: "No se pudo borrar la categoría",
      prefix: "Categorías",
    });
  }
};

export const categoriasService = {
  getAll,
  getById,
  create,
  update,
  toggle,
  remove,
};
