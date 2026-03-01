import { useCallback, useEffect, useState } from "react";
import { metricasService } from "@/entities/metricas/api/metricas.service";
import type { MetricasResponse } from "@/types/metricas";

export type MetricsMonthsFilter = 1 | 3 | 6 | 12;

type UseMetricasAdminResult = {
  metricas: MetricasResponse | null;
  loading: boolean;
  error: string;
  refresh: () => Promise<void>;
  months: MetricsMonthsFilter;
  setMonths: (months: MetricsMonthsFilter) => void;
};

export const useMetricasAdmin = (): UseMetricasAdminResult => {
  const [metricas, setMetricas] = useState<MetricasResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [months, setMonths] = useState<MetricsMonthsFilter>(12);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await metricasService.getDashboardMetricas(months);
      setMetricas(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "No se pudieron cargar las métricas";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [months]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return {
    metricas,
    loading,
    error,
    refresh,
    months,
    setMonths,
  };
};
