import apiClient, { parseApiError } from '@/shared/api/apiClient';
import type { CreateResenaPayload, ResenasProductoResponse } from '@/types/resenas';

const getByProducto = async (idProducto: number): Promise<ResenasProductoResponse> => {
  try {
    const { data } = await apiClient.get<ResenasProductoResponse>(`/resenas/producto/${idProducto}`);
    return data;
  } catch (error) {
    throw parseApiError(error, {
      fallbackMessage: 'No se pudieron obtener las reseñas del producto',
      prefix: 'Reseñas',
    });
  }
};

const create = async (
  idProducto: number,
  payload: CreateResenaPayload,
): Promise<ResenasProductoResponse> => {
  try {
    const { data } = await apiClient.post<ResenasProductoResponse>(`/resenas/producto/${idProducto}`, payload);
    return data;
  } catch (error) {
    throw parseApiError(error, {
      fallbackMessage: 'No se pudo crear la reseña del producto',
      prefix: 'Reseñas',
    });
  }
};

export const resenasService = {
  getByProducto,
  create,
};
