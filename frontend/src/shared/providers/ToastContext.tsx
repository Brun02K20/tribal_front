"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";

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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  const toastViewport = (
    <div
      className="pointer-events-none fixed top-4 right-4 left-auto bottom-auto z-2147483647 flex w-[min(22rem,calc(100vw-2rem))] flex-col gap-2"
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
