"use client";

import AdminOnly from "@/features/admin/components/AdminOnly";
import Metricas from "./Metricas";

export default function MetricasPage() {
  return (
    <AdminOnly>
      <Metricas />
    </AdminOnly>
  );
}
