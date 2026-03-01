"use client";

import AdminOnly from "@/features/admin/components/AdminOnly";
import Dashboard from "./Dashboard";

export default function DashboardPage() {
  return (
    <AdminOnly>
      <Dashboard />
    </AdminOnly>
  );
}

