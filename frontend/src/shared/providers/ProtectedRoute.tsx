"use client";

import React, { useEffect } from "react";
import { useAuth } from "./AuthContext";
import { usePathname, useRouter } from "next/navigation";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      // Volver a la página que se quería ver después de iniciar sesión.
      router.replace(pathname ? `/login?redirect=${encodeURIComponent(pathname)}` : "/login");
    }
  }, [isAuthenticated, loading, pathname, router]);

  if (loading) {
    return <div className="p-8 text-center">Cargando...</div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  return children;
};

export default ProtectedRoute;