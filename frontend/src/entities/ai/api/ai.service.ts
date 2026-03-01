import apiClient, { parseApiError } from '@/shared/api/apiClient';
import type { AiAdminSummaryResponse } from '@/types/ai';

const getAdminSummary = async (): Promise<AiAdminSummaryResponse> => {
  try {
    const { data } = await apiClient.get<AiAdminSummaryResponse>('/ai/admin-summary');
    return data;
  } catch (error) {
    throw parseApiError(error, {
      fallbackMessage: 'No se pudo obtener el resumen AI',
      prefix: 'AI',
    });
  }
};

export const aiService = {
  getAdminSummary,
};
