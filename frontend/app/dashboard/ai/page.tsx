"use client";

import AdminOnly from "@/features/admin/components/AdminOnly";
import AI from "./AI";

export default function AiPage() {
  return (
    <AdminOnly>
      <AI />
    </AdminOnly>
  );
}
