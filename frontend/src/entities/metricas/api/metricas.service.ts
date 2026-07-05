import apiClient, { parseApiError } from "@/shared/api/apiClient";
import type { MetricasResponse } from "@/types/metricas";

const getDashboardMetricas = async (params: {
  months?: number;
  userPage?: number;
  userPageSize?: number;
  auditPage?: number;
  auditPageSize?: number;
  auditEventType?: string;
  auditDateFrom?: string;
  auditDateTo?: string;
  auditUserId?: number;
  auditEntityType?: string;
  auditEntityId?: number;
} = {}): Promise<MetricasResponse> => {
  try {
    const { data } = await apiClient.get<MetricasResponse>("/metricas", {
      params: {
        months: params.months ?? 12,
        userPage: params.userPage ?? 1,
        userPageSize: params.userPageSize ?? 10,
        auditPage: params.auditPage ?? 1,
        auditPageSize: params.auditPageSize ?? 20,
        auditEventType: params.auditEventType || undefined,
        auditDateFrom: params.auditDateFrom || undefined,
        auditDateTo: params.auditDateTo || undefined,
        auditUserId: params.auditUserId || undefined,
        auditEntityType: params.auditEntityType || undefined,
        auditEntityId: params.auditEntityId || undefined,
      },
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
