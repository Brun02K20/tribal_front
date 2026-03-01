"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { useAuth } from "@/src/context/AuthContext";
import { useToast } from "@/src/context/ToastContext";
import { usuariosService } from "@/src/services/usuarios/usuarios.service";
import { locationsService } from "@/src/services/locations/locations.service";
import type { Ciudad, Provincia } from "@/types/locations";
import type {
  AccountConfigAddress,
  AccountConfigFormValues,
  UpdateAccountConfigPayload,
} from "@/types/usuarios";

const emptyValues: AccountConfigFormValues = {
  nombre: "",
  email: "",
  username: "",
  telefono: "",
  password: "",
  direcciones: [],
};

const buildEmptyAddress = (userId: number, idProvincia = 0): AccountConfigAddress => ({
  cod_postal_destino: "",
  calle: "",
  altura: "",
  id_provincia: idProvincia,
  id_ciudad: 0,
  id_usuario: userId,
});

export type UseAccountConfigResult = {
  loading: boolean;
  submitting: boolean;
  error: string | null;
  canEdit: boolean;
  provincias: Provincia[];
  getCitiesByProvincia: (idProvincia: number) => Ciudad[];
  register: ReturnType<typeof useForm<AccountConfigFormValues>>["register"];
  handleSubmit: ReturnType<typeof useForm<AccountConfigFormValues>>["handleSubmit"];
  formState: ReturnType<typeof useForm<AccountConfigFormValues>>["formState"];
  addressFields: ReturnType<typeof useFieldArray<AccountConfigFormValues, "direcciones">>["fields"];
  watch: ReturnType<typeof useForm<AccountConfigFormValues>>["watch"];
  addAddress: () => void;
  removeAddress: (index: number) => void;
  onProvinciaChange: (index: number, idProvincia: number) => void;
  submit: (values: AccountConfigFormValues) => Promise<void>;
};

export function useAccountConfig(): UseAccountConfigResult {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [provincias, setProvincias] = useState<Provincia[]>([]);
  const [citiesByProvincia, setCitiesByProvincia] = useState<Record<number, Ciudad[]>>({});

  const requestedProvinciasRef = useRef<Set<number>>(new Set());

  const form = useForm<AccountConfigFormValues>({
    defaultValues: emptyValues,
  });

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState,
  } = form;

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "direcciones",
  });

  const watchedDirecciones = watch("direcciones");

  const ensureCitiesLoaded = useCallback(async (idProvincia: number) => {
    if (!idProvincia || requestedProvinciasRef.current.has(idProvincia)) {
      return;
    }

    requestedProvinciasRef.current.add(idProvincia);

    try {
      const ciudades = await locationsService.getCiudadesByProvincia(idProvincia);
      setCitiesByProvincia((prev) => ({ ...prev, [idProvincia]: ciudades }));
    } catch (err) {
      requestedProvinciasRef.current.delete(idProvincia);
      throw err;
    }
  }, []);

  const hydrate = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [config, provinciasData] = await Promise.all([
        usuariosService.getAccountConfig(user.id),
        locationsService.getProvincias(),
      ]);

      setProvincias(provinciasData);

      const mappedAddresses = (config.direcciones ?? []).map((direccion) => ({
        cod_postal_destino: direccion.cod_postal_destino,
        calle: direccion.calle,
        altura: direccion.altura,
        id_provincia: Number(direccion.id_provincia),
        id_ciudad: Number(direccion.id_ciudad),
        id_usuario: user.id,
      }));

      reset({
        nombre: config.nombre ?? "",
        email: config.email ?? "",
        username: config.username ?? "",
        telefono: config.telefono ?? "",
        password: "",
        direcciones: mappedAddresses,
      });

      const provinceIds = [...new Set(mappedAddresses.map((d) => Number(d.id_provincia)).filter(Boolean))];
      await Promise.all(provinceIds.map((idProvincia) => ensureCitiesLoaded(idProvincia)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo cargar la configuración de la cuenta");
    } finally {
      setLoading(false);
    }
  }, [ensureCitiesLoaded, reset, user?.id]);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      void hydrate();
    }
  }, [authLoading, hydrate, isAuthenticated]);

  useEffect(() => {
    const run = async () => {
      try {
        const provinceIds = [...new Set((watchedDirecciones ?? []).map((d) => Number(d?.id_provincia)).filter(Boolean))];
        await Promise.all(provinceIds.map((idProvincia) => ensureCitiesLoaded(idProvincia)));
      } catch (err) {
        setError(err instanceof Error ? err.message : "No se pudieron cargar ciudades");
      }
    };

    void run();
  }, [ensureCitiesLoaded, watchedDirecciones]);

  const addAddress = () => {
    if (!user?.id) {
      return;
    }

    append(buildEmptyAddress(user.id, provincias[0]?.id ?? 0));
  };

  const removeAddress = (index: number) => {
    remove(index);
  };

  const onProvinciaChange = (index: number, idProvincia: number) => {
    setValue(`direcciones.${index}.id_provincia`, idProvincia);
    setValue(`direcciones.${index}.id_ciudad`, 0);

    void ensureCitiesLoaded(idProvincia).catch((err) => {
      setError(err instanceof Error ? err.message : "No se pudieron cargar ciudades");
    });
  };

  const getCitiesByProvincia = (idProvincia: number) => citiesByProvincia[idProvincia] ?? [];

  const submit = async (values: AccountConfigFormValues) => {
    if (!user?.id) {
      setError("No se pudo identificar el usuario");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const payload: UpdateAccountConfigPayload = {
        username: values.username,
        telefono: values.telefono,
        direcciones: (values.direcciones ?? []).map((direccion) => ({
          cod_postal_destino: direccion.cod_postal_destino,
          calle: direccion.calle,
          altura: direccion.altura,
          id_provincia: Number(direccion.id_provincia),
          id_ciudad: Number(direccion.id_ciudad),
          id_usuario: user.id,
        })),
      };

      if (values.password?.trim()) {
        payload.password = values.password.trim();
      }

      const response = await usuariosService.updateAccountConfig(user.id, payload);
      showToast(response.message || "Configuración actualizada", "success");

      await hydrate();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo actualizar la configuración");
    } finally {
      setSubmitting(false);
    }
  };

  return {
    loading,
    submitting,
    error,
    canEdit: user?.id_rol === 2,
    provincias,
    getCitiesByProvincia,
    register,
    handleSubmit,
    formState,
    addressFields: fields,
    watch,
    addAddress,
    removeAddress,
    onProvinciaChange,
    submit,
  };
}
