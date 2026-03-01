"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/shared/providers/AuthContext";
import type { AdminOnlyProps } from "@/types/admin-ui";

export default function AdminOnly({ children }: AdminOnlyProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, loading, user } = useAuth();

  useEffect(() => {
    if (loading) {
      return;
    }

    if (!isAuthenticated) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname || "/dashboard")}`);
      return;
    }

    if (user?.id_rol !== 1) {
      router.replace("/products");
    }
  }, [isAuthenticated, loading, pathname, router, user?.id_rol]);

  if (loading || !isAuthenticated || user?.id_rol !== 1) {
    return <main className="app-page">Cargando panel de administración...</main>;
  }

  return <>{children}</>;
}

