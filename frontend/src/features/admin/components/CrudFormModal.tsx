"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import type { CrudFormModalProps, CrudFormValues } from "@/types/admin-ui";
import AppModal from "@/shared/ui/AppModal";

export default function CrudFormModal({
  isOpen,
  mode,
  title,
  fields,
  initialValues,
  onClose,
  onSubmit,
}: CrudFormModalProps) {
  const isView = mode === "view";

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CrudFormValues>({
    defaultValues: initialValues,
  });

  useEffect(() => {
    if (isOpen) {
      reset(initialValues);
    }
  }, [initialValues, isOpen, reset]);

  if (!isOpen) {
    return null;
  }

  return (
    <AppModal>
      <div className="app-modal-backdrop">
        <div className="app-modal-card max-w-md p-4 sm:p-5">
        <h3 className="app-title text-xl">{title}</h3>

        <form className="mt-4 space-y-3" onSubmit={handleSubmit((values) => onSubmit(values))}>
          {fields.map((field) => {
            const fieldError = errors[field.name];

            return (
              <div key={field.name}>
                <label className="mb-1 block text-sm font-medium text-dark-gray">{field.label}</label>

                {field.type === "select" ? (
                  <select
                    className="app-input"
                    disabled={isView}
                    {...register(field.name as never, {
                      required: field.required,
                      setValueAs: (value) => (field.type === "number" ? Number(value) : value),
                    })}
                  >
                    <option value="">Seleccionar...</option>
                    {(field.options ?? []).map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={field.type ?? "text"}
                    placeholder={field.placeholder ?? `Ej: ${field.label}`}
                    className="app-input"
                    disabled={isView}
                    {...register(field.name as never, {
                      required: field.required,
                      valueAsNumber: field.type === "number",
                    })}
                  />
                )}

                {fieldError && (
                  <p className="mt-1 text-sm text-red-600">{String(fieldError.message ?? "Campo inválido")}</p>
                )}
              </div>
            );
          })}

          <div className="mt-5 flex justify-end gap-2">
            <button type="button" className="app-btn-secondary" onClick={onClose}>
              {isView ? "Volver" : "Cancelar"}
            </button>

            {!isView && (
              <button type="submit" className="app-btn-primary" disabled={isSubmitting}>
                {mode === "create" ? "Crear" : "Guardar"}
              </button>
            )}
          </div>
        </form>
        </div>
      </div>
    </AppModal>
  );
}

