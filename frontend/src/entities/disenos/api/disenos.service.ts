import apiClient, { parseApiError } from "@/shared/api/apiClient";
import type { Diseno, DisenoFormValues } from "@/types/disenos";

const getByProducto = async (idProducto: number): Promise<Diseno[]> => {
  try {
    const { data } = await apiClient.get<Diseno[]>(`/disenos/producto/${idProducto}`);
    return data;
  } catch (error) {
    throw parseApiError(error, {
      fallbackMessage: "No se pudieron obtener los diseños",
      prefix: "Diseños",
    });
  }
};

const create = async (idProducto: number, payload: DisenoFormValues, file: File): Promise<Diseno> => {
  try {
    const formData = new FormData();
    formData.append("diseno", JSON.stringify(payload));
    formData.append("file", file);
    const { data } = await apiClient.post<Diseno>(`/disenos/producto/${idProducto}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  } catch (error) {
    throw parseApiError(error, {
      fallbackMessage: "No se pudo crear el diseño",
      prefix: "Diseños",
    });
  }
};

const update = async (id: number, idProducto: number, payload: DisenoFormValues, file?: File | null): Promise<Diseno> => {
  try {
    const formData = new FormData();
    formData.append("diseno", JSON.stringify(payload));
    formData.append("id_producto", String(idProducto));
    if (file) {
      formData.append("file", file);
    }
    const { data } = await apiClient.put<Diseno>(`/disenos/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  } catch (error) {
    throw parseApiError(error, {
      fallbackMessage: "No se pudo actualizar el diseño",
      prefix: "Diseños",
    });
  }
};

const remove = async (id: number): Promise<{ id: number; message: string }> => {
  try {
    const { data } = await apiClient.delete<{ id: number; message: string }>(`/disenos/${id}`);
    return data;
  } catch (error) {
    throw parseApiError(error, {
      fallbackMessage: "No se pudo eliminar el diseño",
      prefix: "Diseños",
    });
  }
};

export const disenosService = {
  getByProducto,
  create,
  update,
  remove,
};
