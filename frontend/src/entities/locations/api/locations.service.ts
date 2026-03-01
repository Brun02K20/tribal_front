import apiClient, { parseApiError } from "@/shared/api/apiClient";
import type { Ciudad, Provincia } from "@/types/locations";

const getProvincias = async (): Promise<Provincia[]> => {
  try {
    const { data } = await apiClient.get<Provincia[]>("/provincias");
    return data;
  } catch (error) {
    throw parseApiError(error, {
      fallbackMessage: "No se pudieron obtener las provincias",
      prefix: "Ubicaciones",
    });
  }
};

const getCiudadesByProvincia = async (idProvincia: number): Promise<Ciudad[]> => {
  try {
    const { data } = await apiClient.get<Ciudad[]>(`/ciudades/provincia/${idProvincia}`);
    return data;
  } catch (error) {
    throw parseApiError(error, {
      fallbackMessage: "No se pudieron obtener las ciudades",
      prefix: "Ubicaciones",
    });
  }
};

export const locationsService = {
  getProvincias,
  getCiudadesByProvincia,
};
