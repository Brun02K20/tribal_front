"use client";

import { useCallback, useState } from 'react';
import { aiService } from '@/entities/ai/api/ai.service';
import type { AiAdminSummaryResponse } from '@/types/ai';

type UseAdminAiSummaryResult = {
  summary: AiAdminSummaryResponse | null;
  loading: boolean;
  error: string;
  refresh: () => Promise<void>;
};

const DAILY_LIMIT_MESSAGE = 'NO PUEDES USAR ESTA ACCION';

export const useAdminAiSummary = (): UseAdminAiSummaryResult => {
  const [summary, setSummary] = useState<AiAdminSummaryResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const data = await aiService.getAdminSummary();
      setSummary(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudo cargar la información AI';
      setError(message.includes(DAILY_LIMIT_MESSAGE) ? DAILY_LIMIT_MESSAGE : message);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    summary,
    loading,
    error,
    refresh,
  };
};
