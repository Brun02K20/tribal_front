"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { AuthContextType, AuthUser } from "@/types/auth";

const STORAGE_KEY = "auth.session";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        setLoading(false);
        return;
      }

      const parsed = JSON.parse(stored) as { user: AuthUser; token: string };
      if (parsed?.token && parsed?.user) {
        setToken(parsed.token);
        setUser(parsed.user);
        setIsAuthenticated(true);
      }
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = ({ user: userData, token: sessionToken }: { user: AuthUser; token: string }) => {
    setUser(userData);
    setToken(sessionToken);
    setIsAuthenticated(true);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ user: userData, token: sessionToken }));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
    window.localStorage.removeItem(STORAGE_KEY);
  };

  const value = useMemo(
    () => ({ isAuthenticated, loading, user, token, login, logout }),
    [isAuthenticated, loading, user, token],
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