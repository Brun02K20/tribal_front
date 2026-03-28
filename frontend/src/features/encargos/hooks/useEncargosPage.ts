"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/shared/providers/AuthContext";
import { encargosService } from "@/entities/encargos/api/encargos.service";
import { usuariosService } from "@/entities/usuarios/api/usuarios.service";
import { locationsService } from "@/entities/locations/api/locations.service";
import type { Encargo } from "@/types/encargos";
import type { Ciudad, Provincia } from "@/types/locations";
import type { CreateUserAddressPayload, UserAddress } from "@/types/usuarios";

type EditFormState = {
  presupuesto: string;
  ancho: string;
  alto: string;
  profundo: string;
  peso_en_gramos: string;
};

const initialAddressForm: CreateUserAddressPayload = {
  cod_postal_destino: "",
  calle: "",
  altura: "",
  id_provincia: 0,
  id_ciudad: 0,
};

const initialEditForm: EditFormState = {
  presupuesto: "",
  ancho: "",
  alto: "",
  profundo: "",
  peso_en_gramos: "",
};

export function useEncargosPage() {
  const { user } = useAuth();
  const isAdmin = user?.id_rol === 1;

  const [encargos, setEncargos] = useState<Encargo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [descripcion, setDescripcion] = useState("");
  const [creatingEncargo, setCreatingEncargo] = useState(false);

  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<number>(0);

  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [creatingAddress, setCreatingAddress] = useState(false);
  const [provincias, setProvincias] = useState<Provincia[]>([]);
  const [ciudades, setCiudades] = useState<Ciudad[]>([]);
  const [addressForm, setAddressForm] = useState<CreateUserAddressPayload>(initialAddressForm);

  const [encargoEnEdicion, setEncargoEnEdicion] = useState<Encargo | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [editForm, setEditForm] = useState<EditFormState>(initialEditForm);
  const [encargoEnDetalle, setEncargoEnDetalle] = useState<Encargo | null>(null);

  const [generatingLinkId, setGeneratingLinkId] = useState<number | null>(null);

  const sortedEncargos = useMemo(
    () => [...encargos].sort((a, b) => Number(b.id) - Number(a.id)),
    [encargos],
  );

  const loadEncargos = async () => {
    if (!user?.id) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = isAdmin
        ? await encargosService.getAllEncargosForAdmin()
        : await encargosService.getMyEncargos();
      setEncargos(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudieron cargar los encargos");
    } finally {
      setLoading(false);
    }
  };

  const loadAddresses = async () => {
    if (!user?.id || isAdmin) {
      return;
    }

    setLoadingAddresses(true);

    try {
      const data = await usuariosService.getUserAddresses(user.id);
      setAddresses(data);
      setSelectedAddressId((prev) => {
        if (prev && data.some((address) => address.id === prev)) {
          return prev;
        }

        return data[0]?.id ?? 0;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudieron cargar direcciones");
    } finally {
      setLoadingAddresses(false);
    }
  };

  useEffect(() => {
    void loadEncargos();
    if (!isAdmin) {
      void loadAddresses();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, user?.id_rol]);

  const openAddressModal = async () => {
    setError(null);
    setAddressForm({
      ...initialAddressForm,
      id_provincia: provincias[0]?.id ?? 0,
    });
    setIsAddressModalOpen(true);

    if (!provincias.length) {
      try {
        const data = await locationsService.getProvincias();
        setProvincias(data);
        const firstProvinciaId = data[0]?.id ?? 0;
        setAddressForm((prev) => ({
          ...prev,
          id_provincia: firstProvinciaId,
        }));

        if (firstProvinciaId > 0) {
          const ciudadesByProvincia = await locationsService.getCiudadesByProvincia(firstProvinciaId);
          setCiudades(ciudadesByProvincia);
          setAddressForm((prev) => ({
            ...prev,
            id_ciudad: ciudadesByProvincia[0]?.id ?? 0,
          }));
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "No se pudieron cargar provincias");
      }
    }
  };

  const closeAddressModal = () => {
    setIsAddressModalOpen(false);
    setCreatingAddress(false);
  };

  const handleAddressProvinciaChange = async (idProvincia: number) => {
    setAddressForm((prev) => ({
      ...prev,
      id_provincia: idProvincia,
      id_ciudad: 0,
    }));

    if (!idProvincia) {
      setCiudades([]);
      return;
    }

    try {
      const data = await locationsService.getCiudadesByProvincia(idProvincia);
      setCiudades(data);
      setAddressForm((prev) => ({
        ...prev,
        id_ciudad: data[0]?.id ?? 0,
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudieron cargar ciudades");
    }
  };

  const handleCreateAddress = async (event: FormEvent) => {
    event.preventDefault();

    if (!user?.id) {
      setError("Sesión inválida para crear dirección");
      return;
    }

    if (!addressForm.calle.trim() || !addressForm.altura.trim() || !addressForm.cod_postal_destino.trim()) {
      setError("Completá calle, altura y código postal");
      return;
    }

    if (!/^\d+$/.test(addressForm.altura.trim())) {
      setError("La altura debe ser numérica");
      return;
    }

    if (!addressForm.id_provincia || !addressForm.id_ciudad) {
      setError("Seleccioná provincia y ciudad");
      return;
    }

    setCreatingAddress(true);
    setError(null);

    try {
      const created = await usuariosService.createUserAddress(user.id, {
        cod_postal_destino: addressForm.cod_postal_destino.trim(),
        calle: addressForm.calle.trim(),
        altura: addressForm.altura.trim(),
        id_provincia: Number(addressForm.id_provincia),
        id_ciudad: Number(addressForm.id_ciudad),
      });
      setAddresses((prev) => [created, ...prev]);
      setSelectedAddressId(created.id);
      setSuccess("Dirección creada correctamente.");
      closeAddressModal();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo crear la dirección");
    } finally {
      setCreatingAddress(false);
    }
  };

  const handleCreateEncargo = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (!selectedAddressId) {
      setError("Seleccioná una dirección para crear el encargo");
      return;
    }

    if (!descripcion.trim()) {
      setError("La descripción del encargo es obligatoria");
      return;
    }

    setCreatingEncargo(true);
    try {
      await encargosService.createEncargo({
        id_direccion: selectedAddressId,
        descripcion: descripcion.trim(),
      });
      setDescripcion("");
      setSuccess("Encargo creado correctamente.");
      await loadEncargos();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo crear el encargo");
    } finally {
      setCreatingEncargo(false);
    }
  };

  const openEditModal = (encargo: Encargo) => {
    setError(null);
    setSuccess(null);
    setEncargoEnEdicion(encargo);
    setEditForm({
      presupuesto: String(encargo.presupuesto ?? ""),
      ancho: String(encargo.ancho ?? ""),
      alto: String(encargo.alto ?? ""),
      profundo: String(encargo.profundo ?? ""),
      peso_en_gramos: String(encargo.peso_en_gramos ?? ""),
    });
  };

  const closeEditModal = () => {
    setEncargoEnEdicion(null);
    setSavingEdit(false);
  };

  const handleSaveEdit = async (event: FormEvent) => {
    event.preventDefault();

    if (!encargoEnEdicion) {
      return;
    }

    setError(null);
    setSuccess(null);

    const presupuesto = Number(editForm.presupuesto);
    const ancho = Number(editForm.ancho);
    const alto = Number(editForm.alto);
    const profundo = Number(editForm.profundo);
    const pesoEnGramos = Number(editForm.peso_en_gramos);

    if ([presupuesto, ancho, alto, profundo, pesoEnGramos].some((value) => !Number.isFinite(value) || value <= 0)) {
      setError("Completá presupuesto, ancho, alto, profundo y peso con valores mayores a 0");
      return;
    }

    setSavingEdit(true);
    try {
      await encargosService.updatePresupuesto(encargoEnEdicion.id, {
        presupuesto,
        ancho,
        alto,
        profundo,
        peso_en_gramos: pesoEnGramos,
      });
      setSuccess(`Encargo #${encargoEnEdicion.id} actualizado correctamente.`);
      closeEditModal();
      await loadEncargos();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo actualizar el encargo");
    } finally {
      setSavingEdit(false);
    }
  };

  const handleGeneratePaymentLink = async (encargo: Encargo) => {
    setError(null);
    setSuccess(null);
    setGeneratingLinkId(encargo.id);

    try {
      const response = await encargosService.generatePaymentLink(encargo.id);
      setSuccess(`Link enviado al cliente (${response.email_sent_to}) para el encargo #${encargo.id}.`);
      await loadEncargos();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo generar el link de pago");
    } finally {
      setGeneratingLinkId(null);
    }
  };

  const isCompleteForPayment = (encargo: Encargo) => {
    return (
      Number(encargo.presupuesto ?? 0) > 0
      && Number(encargo.ancho ?? 0) > 0
      && Number(encargo.alto ?? 0) > 0
      && Number(encargo.profundo ?? 0) > 0
      && Number(encargo.peso_en_gramos ?? 0) > 0
    );
  };

  const isPaid = (encargo: Encargo) => {
    const estado = encargo.estado_encargo?.nombre?.trim().toLowerCase() ?? "";
    return /pagad|abonad|pago/.test(estado);
  };

  const canClientPay = (encargo: Encargo) => !isPaid(encargo) && isCompleteForPayment(encargo);

  const handleClientPay = (encargo: Encargo) => {
    setError(null);
    setSuccess(null);

    if (isPaid(encargo)) {
      setSuccess(`El encargo #${encargo.id} ya figura como pagado.`);
      return;
    }

    if (!isCompleteForPayment(encargo)) {
      setError("Todavía no está listo para pagar. Esperá que administración cargue presupuesto y medidas.");
      return;
    }

    setSuccess(`Para pagar el encargo #${encargo.id}, usá el link que recibiste por email.`);
  };

  const openDetailModal = (encargo: Encargo) => {
    setEncargoEnDetalle(encargo);
  };

  const closeDetailModal = () => {
    setEncargoEnDetalle(null);
  };

  return {
    user,
    isAdmin,
    loading,
    error,
    success,
    sortedEncargos,
    descripcion,
    creatingEncargo,
    addresses,
    loadingAddresses,
    selectedAddressId,
    isAddressModalOpen,
    creatingAddress,
    provincias,
    ciudades,
    addressForm,
    encargoEnEdicion,
    encargoEnDetalle,
    savingEdit,
    editForm,
    generatingLinkId,
    setDescripcion,
    setSelectedAddressId,
    setAddressForm,
    setEditForm,
    openAddressModal,
    closeAddressModal,
    handleAddressProvinciaChange,
    handleCreateAddress,
    handleCreateEncargo,
    openEditModal,
    closeEditModal,
    handleSaveEdit,
    handleGeneratePaymentLink,
    isCompleteForPayment,
    isPaid,
    canClientPay,
    handleClientPay,
    openDetailModal,
    closeDetailModal,
  };
}
