import apiClient, { parseApiError } from "@/shared/api/apiClient";
import type { MetricasResponse } from "@/types/metricas";

const getDashboardMetricas = async (months = 12): Promise<MetricasResponse> => {
  try {
    const { data } = await apiClient.get<MetricasResponse>("/metricas", {
      params: { months },
    });
    return data;
  } catch (error) {
    throw parseApiError(error, {
      fallbackMessage: "No se pudieron obtener las métricas",
      prefix: "Métricas",
    });
  }
};

export const metricasService = {
  getDashboardMetricas,
};
