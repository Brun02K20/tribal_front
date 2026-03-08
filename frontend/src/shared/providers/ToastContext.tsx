"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";

type ToastVariant = "success" | "error" | "info";

type ToastItem = {
  id: number;
  message: string;
  variant: ToastVariant;
  leaving?: boolean;
};

type ToastContextType = {
  showToast: (message: string, variant?: ToastVariant) => void;
};

const ToastContext = createContext<ToastContextType | undefined>(undefined);

const TOAST_TIMEOUT_MS = 2800;
const TOAST_EXIT_MS = 220;

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const dismissToast = useCallback((id: number) => {
    setToasts((prev) =>
      prev.map((toast) => (toast.id === id ? { ...toast, leaving: true } : toast)),
    );

    window.setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, TOAST_EXIT_MS);
  }, []);

  const showToast = useCallback((message: string, variant: ToastVariant = "info") => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    setToasts((prev) => [...prev, { id, message, variant, leaving: false }]);

    window.setTimeout(() => {
      dismissToast(id);
    }, TOAST_TIMEOUT_MS);
  }, [dismissToast]);

  const value = useMemo(() => ({ showToast }), [showToast]);

  const toastViewport = (
    <div
      className="app-toast-root pointer-events-none flex w-[min(22rem,calc(100vw-2rem))] flex-col gap-2"
      style={{
        position: "fixed",
        top: "1rem",
        right: "1rem",
        left: "auto",
        bottom: "auto",
        zIndex: 2147483647,
      }}
    >
      {toasts.map((toast) => (
        <div key={toast.id} className="app-panel pointer-events-auto p-3">
        <div
          key={toast.id}
          className="app-panel pointer-events-auto p-3"
          style={{
            transform: toast.leaving ? "translateY(-6px) scale(0.98)" : "translateY(0) scale(1)",
            opacity: toast.leaving ? 0 : 1,
            transition: "transform 220ms ease, opacity 220ms ease",
          }}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="app-title text-sm">
                {toast.variant === "success" ? "Éxito" : toast.variant === "error" ? "Error" : "Información"}
              </p>
              <p className="app-subtitle mt-1 text-sm">{toast.message}</p>
            </div>
            <button
              type="button"
              className="app-btn-secondary px-2 py-1 text-xs"
              onClick={() => dismissToast(toast.id)}
            >
              Cerrar
            </button>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      {mounted ? createPortal(toastViewport, document.body) : null}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast debe usarse dentro de ToastProvider");
  }

  return context;
};
