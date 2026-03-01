"use client";

import type { UseAccountConfigResult } from "@/features/account/hooks/useAccountConfig";
import { SOUTH_AMERICA_PHONE_OPTIONS } from "@/shared/lib/south-america-phone";
import ErrorState from "@/shared/ui/ErrorState";
import LoadingState from "@/shared/ui/LoadingState";
import EmptyState from "@/shared/ui/EmptyState";

type AccountConfigFormProps = {
  model: UseAccountConfigResult;
};

export default function AccountConfigForm({ model }: AccountConfigFormProps) {
  const {
    loading,
    submitting,
    error,
    provincias,
    getCitiesByProvincia,
    register,
    handleSubmit,
    formState,
    addressFields,
    watch,
    telefonoDialCode,
    telefonoLocalNumber,
    onTelefonoDialCodeChange,
    onTelefonoLocalNumberChange,
    addAddress,
    removeAddress,
    onProvinciaChange,
    submit,
  } = model;

  const nombre = watch("nombre");
  const email = watch("email");

  if (loading) {
    return <LoadingState message="Cargando configuración de cuenta..." />;
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit(submit)}>
      {error && <ErrorState message={error} className="text-sm text-red-600" />}

      <section className="app-panel p-4">
        <h2 className="app-title text-lg">Datos personales</h2>
        <p className="app-subtitle mt-1 text-sm">Datos vinculados a Google son solo lectura.</p>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-dark-gray">Nombre (solo lectura)</label>
            <input className="app-input" value={nombre ?? ""} disabled readOnly />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-dark-gray">Email (solo lectura)</label>
            <input className="app-input" value={email ?? ""} disabled readOnly />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-dark-gray">Username</label>
            <input
              className="app-input"
              placeholder="Ej: juanperez"
              {...register("username")}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-dark-gray">Teléfono</label>
            <div className="grid grid-cols-[150px_minmax(0,1fr)] gap-2">
              <select
                className="app-input"
                value={telefonoDialCode}
                onChange={(event) => onTelefonoDialCodeChange(event.target.value)}
              >
                {SOUTH_AMERICA_PHONE_OPTIONS.map((option) => (
                  <option key={option.dialCode} value={option.dialCode}>
                    {option.country} ({option.dialCode})
                  </option>
                ))}
              </select>

              <input
                className="app-input"
                inputMode="numeric"
                placeholder="Ej: 3511234567"
                value={telefonoLocalNumber}
                onChange={(event) => onTelefonoLocalNumberChange(event.target.value)}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="app-panel p-4">
        <h2 className="app-title text-lg">Contraseña de la plataforma</h2>
        <p className="app-subtitle mt-1 text-sm">Dejá vacío si no querés cambiarla.</p>

        <div className="mt-4 max-w-md">
          <label className="mb-1 block text-sm font-medium text-dark-gray">Nueva contraseña</label>
          <input
            type="password"
            className="app-input"
            placeholder="Ej: MiClaveNueva123"
            {...register("password", {
              minLength: {
                value: 6,
                message: "La contraseña debe tener al menos 6 caracteres",
              },
            })}
          />
          {formState.errors.password && (
            <p className="mt-1 text-sm text-red-600">{formState.errors.password.message}</p>
          )}
        </div>
      </section>

      <section className="app-panel p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="app-title text-lg">Direcciones</h2>
            <p className="app-subtitle mt-1 text-sm">Podés agregar, editar o quitar direcciones de entrega.</p>
          </div>
          <button type="button" className="app-btn-secondary" onClick={addAddress}>
            Agregar dirección
          </button>
        </div>

        {addressFields.length === 0 ? (
          <div className="mt-4">
            <EmptyState message="No tenés direcciones cargadas." />
          </div>
        ) : (
          <div className="mt-4 space-y-4">
            {addressFields.map((field, index) => {
              const selectedProvinciaId = Number(watch(`direcciones.${index}.id_provincia`) || 0);
              const ciudades = getCitiesByProvincia(selectedProvinciaId);

              const provinciaRegister = register(`direcciones.${index}.id_provincia`, {
                valueAsNumber: true,
                validate: (value) => (Number(value) > 0 ? true : "Seleccioná una provincia"),
              });

              return (
                <div key={field.id} className="rounded-md border border-line p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="font-semibold">Dirección #{index + 1}</h3>
                    <button type="button" className="app-btn-secondary" onClick={() => removeAddress(index)}>
                      Quitar
                    </button>
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-sm font-medium text-dark-gray">Calle</label>
                      <input
                        className="app-input"
                        placeholder="Ej: Av. Colón"
                        {...register(`direcciones.${index}.calle`, { required: "La calle es obligatoria" })}
                      />
                      {formState.errors.direcciones?.[index]?.calle && (
                        <p className="mt-1 text-sm text-red-600">{formState.errors.direcciones[index]?.calle?.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="mb-1 block text-sm font-medium text-dark-gray">Altura</label>
                      <input
                        className="app-input"
                        inputMode="numeric"
                        placeholder="Ej: 1234"
                        {...register(`direcciones.${index}.altura`, {
                          required: "La altura es obligatoria",
                          pattern: {
                            value: /^\d+$/,
                            message: "La altura debe ser numérica",
                          },
                        })}
                      />
                      {formState.errors.direcciones?.[index]?.altura && (
                        <p className="mt-1 text-sm text-red-600">{formState.errors.direcciones[index]?.altura?.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="mb-1 block text-sm font-medium text-dark-gray">Código postal</label>
                      <input
                        className="app-input"
                        placeholder="Ej: X5000"
                        {...register(`direcciones.${index}.cod_postal_destino`, {
                          required: "El código postal es obligatorio",
                        })}
                      />
                      {formState.errors.direcciones?.[index]?.cod_postal_destino && (
                        <p className="mt-1 text-sm text-red-600">
                          {formState.errors.direcciones[index]?.cod_postal_destino?.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="mb-1 block text-sm font-medium text-dark-gray">Provincia</label>
                      <select
                        className="app-input"
                        {...provinciaRegister}
                        onChange={(event) => {
                          provinciaRegister.onChange(event);
                          onProvinciaChange(index, Number(event.target.value));
                        }}
                      >
                        <option value={0}>Seleccionar provincia...</option>
                        {provincias.map((provincia) => (
                          <option key={provincia.id} value={provincia.id}>
                            {provincia.nombre}
                          </option>
                        ))}
                      </select>
                      {formState.errors.direcciones?.[index]?.id_provincia && (
                        <p className="mt-1 text-sm text-red-600">
                          {formState.errors.direcciones[index]?.id_provincia?.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="mb-1 block text-sm font-medium text-dark-gray">Ciudad</label>
                      <select
                        className="app-input"
                        {...register(`direcciones.${index}.id_ciudad`, {
                          valueAsNumber: true,
                          validate: (value) => (Number(value) > 0 ? true : "Seleccioná una ciudad"),
                        })}
                      >
                        <option value={0}>Seleccionar ciudad...</option>
                        {ciudades.map((ciudad) => (
                          <option key={ciudad.id} value={ciudad.id}>
                            {ciudad.nombre}
                          </option>
                        ))}
                      </select>
                      {formState.errors.direcciones?.[index]?.id_ciudad && (
                        <p className="mt-1 text-sm text-red-600">{formState.errors.direcciones[index]?.id_ciudad?.message}</p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <div className="flex justify-end">
        <button type="submit" className="app-btn-primary" disabled={submitting}>
          {submitting ? "Guardando..." : "Guardar cambios"}
        </button>
      </div>
    </form>
  );
}

