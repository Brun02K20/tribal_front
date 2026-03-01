"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import type { EstadoModalFormValues, PedidoEstadoModalProps } from "@/types/admin-ui";
import AppModal from "@/src/components/ui/AppModal";

export default function PedidoEstadoModal({
  isOpen,
  mode,
  currentEstadoId,
  options,
  loading,
  onClose,
  onSave,
}: PedidoEstadoModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EstadoModalFormValues>({
    defaultValues: {
      id_estado: currentEstadoId,
    },
  });

  useEffect(() => {
    if (isOpen) {
      reset({ id_estado: currentEstadoId });
    }
  }, [currentEstadoId, isOpen, reset]);

  if (!isOpen) {
    return null;
  }

  const title = mode === "pedido" ? "Elija el nuevo estado del pedido" : "Elija el nuevo estado del envio";

  return (
    <AppModal>
      <div className="app-modal-backdrop">
        <div className="app-modal-card max-w-md p-4 sm:p-5">
        <h3 className="app-title text-xl">{title}</h3>

        <form
          className="mt-4 space-y-3"
          onSubmit={handleSubmit(async (values) => {
            await onSave(Number(values.id_estado));
          })}
        >
          <div>
            <label className="mb-1 block text-sm font-medium text-dark-gray">Estado</label>
            <select
              className="app-input"
              {...register("id_estado", {
                required: "El estado es obligatorio",
                valueAsNumber: true,
                validate: (value) => (value > 0 ? true : "El estado es obligatorio"),
              })}
            >
              <option value={0}>Seleccionar...</option>
              {options.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.nombre}
                </option>
              ))}
            </select>
            {errors.id_estado && <p className="mt-1 text-sm text-red-600">{errors.id_estado.message}</p>}
          </div>

          <div className="mt-5 flex justify-end gap-2">
            <button type="button" className="app-btn-secondary" onClick={onClose} disabled={loading}>
              Cancelar
            </button>
            <button type="submit" className="app-btn-primary" disabled={loading}>
              Guardar
            </button>
          </div>
        </form>
        </div>
      </div>
    </AppModal>
  );
}
