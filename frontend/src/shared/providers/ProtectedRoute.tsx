"use client";

import React, { useEffect } from "react";
import { useAuth } from "./AuthContext";
import { useRouter } from "next/navigation";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, loading, router]);

  if (loading) {
    return <div className="p-8 text-center">Cargando...</div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  return children;
};

export default ProtectedRoute;