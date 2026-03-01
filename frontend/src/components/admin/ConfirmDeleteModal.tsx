"use client";

import type { ConfirmDeleteModalProps } from "@/types/admin-ui";

export default function ConfirmDeleteModal({
  isOpen,
  entityLabel,
  entityName,
  onCancel,
  onConfirm,
  loading,
}: ConfirmDeleteModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="app-panel w-full max-w-md">
        <h3 className="app-title text-xl">Confirmar borrado</h3>
        <p className="app-subtitle mt-3">
          ¿Estás seguro de que querés borrar la {entityLabel} {entityName}?
        </p>

        <div className="mt-5 flex justify-end gap-2">
          <button type="button" className="app-btn-secondary" onClick={onCancel} disabled={loading}>
            Cancelar
          </button>
          <button type="button" className="app-btn-primary" onClick={() => onConfirm()} disabled={loading}>
            Borrar
          </button>
        </div>
      </div>
    </div>
  );
}
