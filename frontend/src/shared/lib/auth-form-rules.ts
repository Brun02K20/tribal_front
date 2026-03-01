import type { FieldValues, Path, RegisterOptions } from "react-hook-form";

export const getAuthEmailRules = <
  TFieldValues extends FieldValues,
  TFieldName extends Path<TFieldValues>,
>(): RegisterOptions<TFieldValues, TFieldName> => ({
  required: "El email es obligatorio",
  pattern: {
    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: "Ingresá un email válido",
  },
});

export const getAuthPasswordRules = <
  TFieldValues extends FieldValues,
  TFieldName extends Path<TFieldValues>,
>(): RegisterOptions<TFieldValues, TFieldName> => ({
  required: "La contraseña es obligatoria",
  minLength: { value: 6, message: "Mínimo 6 caracteres" },
});
