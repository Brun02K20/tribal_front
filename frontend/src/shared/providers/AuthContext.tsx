"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { authService } from "@/entities/auth/api/auth.service";
import type { AuthContextType, AuthUser } from "@/types/auth";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const bootstrapSession = async () => {
      try {
        const data = await authService.me();
        if (!mounted) {
          return;
        }

        setUser(data.user);
        setIsAuthenticated(true);
      } catch {
        if (!mounted) {
          return;
        }

        setUser(null);
        setIsAuthenticated(false);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    bootstrapSession();

    return () => {
      mounted = false;
    };
  }, []);

  const login = ({ user: userData }: { user: AuthUser }) => {
    setUser(userData);
    setIsAuthenticated(true);
  };

  const logout = async () => {
    try {
      await authService.logout();
    } finally {
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const value = useMemo(
    () => ({ isAuthenticated, loading, user, login, logout }),
    [isAuthenticated, loading, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de AuthProvider");
  }
  return context;
};