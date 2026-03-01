"use client";

import AdminOnly from "@/src/components/admin/AdminOnly";
import Dashboard from "./Dashboard";

export default function DashboardPage() {
  return (
    <AdminOnly>
      <Dashboard />
    </AdminOnly>
  );
}
