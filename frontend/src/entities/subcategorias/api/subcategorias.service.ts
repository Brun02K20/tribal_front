import apiClient, { parseApiError } from "@/shared/api/apiClient";
import type {
  Subcategoria,
  SubcategoriaCreatePayload,
  SubcategoriaUpdatePayload,
  SuccessDeleteSubcategoriaResponse,
} from "@/types/subcategorias";

const getAll = async (): Promise<Subcategoria[]> => {
  try {
    const { data } = await apiClient.get<Subcategoria[]>("/subcategorias");
    return data;
  } catch (error) {
    throw parseApiError(error, {
      fallbackMessage: "No se pudieron obtener las subcategorías",
      prefix: "Subcategorías",
    });
  }
};

const getById = async (id: number): Promise<Subcategoria> => {
  try {
    const { data } = await apiClient.get<Subcategoria>(`/subcategorias/${id}`);
    return data;
  } catch (error) {
    throw parseApiError(error, {
      fallbackMessage: "No se pudo obtener la subcategoría",
      prefix: "Subcategorías",
    });
  }
};

const create = async (payload: SubcategoriaCreatePayload): Promise<Subcategoria> => {
  try {
    const { data } = await apiClient.post<Subcategoria>("/subcategorias", payload);
    return data;
  } catch (error) {
    throw parseApiError(error, {
      fallbackMessage: "No se pudo crear la subcategoría",
      prefix: "Subcategorías",
    });
  }
};

const update = async (id: number, payload: SubcategoriaUpdatePayload): Promise<Subcategoria> => {
  try {
    const { data } = await apiClient.put<Subcategoria>(`/subcategorias/${id}`, payload);
    return data;
  } catch (error) {
    throw parseApiError(error, {
      fallbackMessage: "No se pudo actualizar la subcategoría",
      prefix: "Subcategorías",
    });
  }
};

const toggle = async (id: number): Promise<Subcategoria> => {
  try {
    const { data } = await apiClient.put<Subcategoria>(`/subcategorias/toggle/${id}`);
    return data;
  } catch (error) {
    throw parseApiError(error, {
      fallbackMessage: "No se pudo activar/desactivar la subcategoría",
      prefix: "Subcategorías",
    });
  }
};

const remove = async (id: number): Promise<SuccessDeleteSubcategoriaResponse> => {
  try {
    const { data } = await apiClient.delete<SuccessDeleteSubcategoriaResponse>(`/subcategorias/${id}`);
    return data;
  } catch (error) {
    throw parseApiError(error, {
      fallbackMessage: "No se pudo borrar la subcategoría",
      prefix: "Subcategorías",
    });
  }
};

export const subcategoriasService = {
  getAll,
  getById,
  create,
  update,
  toggle,
  remove,
};
