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
  userPage: number;
  userPageSize: number;
  setUserPage: (page: number) => void;
  setUserPageSize: (pageSize: number) => void;
  auditPage: number;
  auditPageSize: number;
  auditEventType: string;
  auditDateFrom: string;
  auditDateTo: string;
  auditUserId: string;
  auditEntityType: string;
  auditEntityId: string;
  setAuditPage: (page: number) => void;
  setAuditPageSize: (pageSize: number) => void;
  setAuditEventType: (value: string) => void;
  setAuditDateFrom: (value: string) => void;
  setAuditDateTo: (value: string) => void;
  setAuditUserId: (value: string) => void;
  setAuditEntityType: (value: string) => void;
  setAuditEntityId: (value: string) => void;
};

export const useMetricasAdmin = (): UseMetricasAdminResult => {
  const [metricas, setMetricas] = useState<MetricasResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [months, setMonths] = useState<MetricsMonthsFilter>(12);
  const [userPage, setUserPage] = useState(1);
  const [userPageSize, setUserPageSize] = useState(10);
  const [auditPage, setAuditPage] = useState(1);
  const [auditPageSize, setAuditPageSize] = useState(20);
  const [auditEventType, setAuditEventType] = useState("");
  const [auditDateFrom, setAuditDateFrom] = useState("");
  const [auditDateTo, setAuditDateTo] = useState("");
  const [auditUserId, setAuditUserId] = useState("");
  const [auditEntityType, setAuditEntityType] = useState("");
  const [auditEntityId, setAuditEntityId] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await metricasService.getDashboardMetricas({
        months,
        userPage,
        userPageSize,
        auditPage,
        auditPageSize,
        auditEventType,
        auditDateFrom,
        auditDateTo,
        auditUserId: auditUserId ? Number(auditUserId) : undefined,
        auditEntityType,
        auditEntityId: auditEntityId ? Number(auditEntityId) : undefined,
      });
      setMetricas(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "No se pudieron cargar las métricas";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [auditDateFrom, auditDateTo, auditEntityId, auditEntityType, auditEventType, auditPage, auditPageSize, auditUserId, months, userPage, userPageSize]);

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
    userPage,
    userPageSize,
    setUserPage,
    setUserPageSize,
    auditPage,
    auditPageSize,
    auditEventType,
    auditDateFrom,
    auditDateTo,
    auditUserId,
    auditEntityType,
    auditEntityId,
    setAuditPage,
    setAuditPageSize,
    setAuditEventType,
    setAuditDateFrom,
    setAuditDateTo,
    setAuditUserId,
    setAuditEntityType,
    setAuditEntityId,
  };
};
