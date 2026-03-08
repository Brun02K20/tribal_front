"use client";

import React, { createContext, useCallback, useContext, useMemo, useState } from "react";

type ToastVariant = "success" | "error" | "info";

type ToastItem = {
  id: number;
  message: string;
  variant: ToastVariant;
};

type ToastContextType = {
  showToast: (message: string, variant?: ToastVariant) => void;
};

const ToastContext = createContext<ToastContextType | undefined>(undefined);

const TOAST_TIMEOUT_MS = 2800;

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismissToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback((message: string, variant: ToastVariant = "info") => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    setToasts((prev) => [...prev, { id, message, variant }]);

    window.setTimeout(() => {
      dismissToast(id);
    }, TOAST_TIMEOUT_MS);
  }, [dismissToast]);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed flex flex-col gap-2"
        style={{
          top: "1rem",
          right: "1rem",
          left: "auto",
          bottom: "auto",
          width: "min(22rem, calc(100vw - 2rem))",
          zIndex: 11000,
        }}
      >
        {toasts.map((toast) => (
          <div key={toast.id} className="app-panel pointer-events-auto p-3">
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
