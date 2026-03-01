"use client";

import type { ConfirmDeleteModalProps } from "@/types/admin-ui";
import AppModal from "@/src/components/ui/AppModal";

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
    <AppModal>
      <div className="app-modal-backdrop">
        <div className="app-modal-card max-w-md p-4 sm:p-5">
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
    </AppModal>
  );
}
