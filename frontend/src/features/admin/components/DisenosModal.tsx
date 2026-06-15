"use client";

import { useEffect, useState } from "react";
import AppModal from "@/shared/ui/AppModal";
import { formatCurrencyArs } from "@/shared/lib/formatters";
import type { Diseno } from "@/types/disenos";
import type { Product } from "@/types/products";

type DisenosModalProps = {
  isOpen: boolean;
  product: Product | null;
  disenos: Diseno[];
  loading: boolean;
  submitting: boolean;
  error: string | null;
  onClose: () => void;
  onCreate: (values: { nombre: string; precio: number }, file: File) => Promise<void>;
  onUpdate: (diseno: Diseno, values: { nombre: string; precio: number }, file?: File | null) => Promise<void>;
  onDelete: (diseno: Diseno) => Promise<void>;
};

type DraftState = {
  mode: "create" | "edit";
  diseno: Diseno | null;
  nombre: string;
  precio: string;
  file: File | null;
  previewUrl: string;
};

const emptyDraft: DraftState = {
  mode: "create",
  diseno: null,
  nombre: "",
  precio: "",
  file: null,
  previewUrl: "",
};

export default function DisenosModal({
  isOpen,
  product,
  disenos,
  loading,
  submitting,
  error,
  onClose,
  onCreate,
  onUpdate,
  onDelete,
}: DisenosModalProps) {
  const [draft, setDraft] = useState<DraftState>(emptyDraft);

  useEffect(() => {
    if (!isOpen) {
      setDraft(emptyDraft);
    }
  }, [isOpen]);

  if (!isOpen || !product) {
    return null;
  }

  const isReadOnlyUniqueProduct = Boolean(product.es_unico);

  const setDraftFile = (file: File | null) => {
    if (draft.previewUrl && draft.file) {
      URL.revokeObjectURL(draft.previewUrl);
    }

    setDraft((prev) => ({
      ...prev,
      file,
      previewUrl: file ? URL.createObjectURL(file) : prev.mode === "edit" ? prev.previewUrl : "",
    }));
  };

  const startEdit = (diseno: Diseno) => {
    if (draft.previewUrl && draft.file) {
      URL.revokeObjectURL(draft.previewUrl);
    }
    setDraft({
      mode: "edit",
      diseno,
      nombre: diseno.nombre,
      precio: String(diseno.precio),
      file: null,
      previewUrl: diseno.url_foto ?? "",
    });
  };

  const resetDraft = () => {
    if (draft.previewUrl && draft.file) {
      URL.revokeObjectURL(draft.previewUrl);
    }
    setDraft(emptyDraft);
  };

  const submitDraft = async () => {
    const nombre = draft.nombre.trim();
    const precio = Number(draft.precio);
    if (!nombre || !Number.isFinite(precio) || precio <= 0) {
      return;
    }

    if (draft.mode === "create") {
      if (!draft.file) {
        return;
      }
      await onCreate({ nombre, precio }, draft.file);
      resetDraft();
      return;
    }

    if (draft.diseno) {
      await onUpdate(draft.diseno, { nombre, precio }, draft.file);
      resetDraft();
    }
  };

  const canSubmit = Boolean(draft.nombre.trim())
    && Number(draft.precio) > 0
    && (draft.mode === "edit" || Boolean(draft.file));

  return (
    <AppModal>
      <div className="app-modal-backdrop">
        <div className="app-modal-card max-w-4xl p-4 sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="app-title text-xl">Diseños de {product.nombre}</h3>
              <p className="app-subtitle mt-1 text-sm">
                {isReadOnlyUniqueProduct
                  ? "Este producto unico tiene un diseno asociado automatico."
                  : "Nombre, precio y foto especifica para cada diseno."}
              </p>
            </div>
            <button type="button" className="app-btn-secondary" onClick={onClose}>
              Cerrar
            </button>
          </div>

          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

          {!isReadOnlyUniqueProduct && (
          <div className="mt-4 rounded-lg border border-line p-3">
            <h4 className="font-semibold">{draft.mode === "create" ? "Nuevo diseño" : "Editar diseño"}</h4>
            <div className="mt-3 grid gap-3 md:grid-cols-[minmax(0,1fr)_160px_180px_auto] md:items-end">
              <div>
                <label className="mb-1 block text-sm text-dark-gray">Nombre</label>
                <input
                  className="app-input"
                  value={draft.nombre}
                  onChange={(event) => setDraft((prev) => ({ ...prev, nombre: event.target.value }))}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-dark-gray">Precio</label>
                <input
                  type="number"
                  step="0.01"
                  className="app-input"
                  value={draft.precio}
                  onChange={(event) => setDraft((prev) => ({ ...prev, precio: event.target.value }))}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-dark-gray">Foto</label>
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                  className="app-input"
                  onChange={(event) => setDraftFile(event.target.files?.[0] ?? null)}
                />
              </div>
              <button
                type="button"
                className="app-btn-primary disabled:cursor-not-allowed disabled:opacity-60"
                onClick={submitDraft}
                disabled={!canSubmit || submitting}
              >
                {draft.mode === "create" ? "Agregar nuevo diseño" : "Guardar diseño"}
              </button>
            </div>
            {draft.previewUrl && (
              <img src={draft.previewUrl} alt="Preview diseño" className="mt-3 h-24 w-24 rounded border border-line object-contain" />
            )}
            {draft.mode === "edit" && (
              <button type="button" className="app-btn-secondary mt-3 text-sm" onClick={resetDraft}>
                Cancelar edición
              </button>
            )}
          </div>
          )}

          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-175 border-collapse">
              <thead>
                <tr className="bg-earth-brown text-cream">
                  <th className="px-3 py-2 text-left">Foto</th>
                  <th className="px-3 py-2 text-left">Nombre</th>
                  <th className="px-3 py-2 text-left">Precio</th>
                  <th className="px-3 py-2 text-left">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td className="px-3 py-4" colSpan={4}>Cargando diseños...</td></tr>
                ) : disenos.length === 0 ? (
                  <tr><td className="px-3 py-4" colSpan={4}>No hay diseños cargados.</td></tr>
                ) : (
                  disenos.map((diseno) => (
                    <tr key={diseno.id} className="border-t border-line">
                      <td className="px-3 py-2">
                        {diseno.url_foto ? (
                          <img src={diseno.url_foto} alt={diseno.nombre} className="h-14 w-14 rounded border border-line object-contain" />
                        ) : (
                          <span className="app-subtitle text-sm">Usa fotos del producto</span>
                        )}
                      </td>
                      <td className="px-3 py-2">{diseno.nombre}</td>
                      <td className="px-3 py-2">{formatCurrencyArs(diseno.precio)}</td>
                      <td className="px-3 py-2">
                        {isReadOnlyUniqueProduct ? (
                          <span className="app-subtitle text-sm">Automatico</span>
                        ) : (
                          <div className="flex gap-2">
                            <button type="button" className="app-btn-secondary px-2 py-1 text-sm" onClick={() => startEdit(diseno)}>
                              Editar
                            </button>
                            <button type="button" className="app-btn-secondary px-2 py-1 text-sm" onClick={() => onDelete(diseno)}>
                              Borrar
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppModal>
  );
}
