"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/shared/providers/CartContext";
import { useAuth } from "@/shared/providers/AuthContext";
import { useToast } from "@/shared/providers/ToastContext";
import { pedidosService } from "@/entities/pedidos/api/pedidos.service";
import { usuariosService } from "@/entities/usuarios/api/usuarios.service";
import { locationsService } from "@/entities/locations/api/locations.service";
import { productosService } from "@/entities/productos/api/productos.service";
import type { Ciudad, Provincia } from "@/types/locations";
import type { CreateUserAddressPayload, UserAddress } from "@/types/usuarios";
import type { PedidoDetalleCreateInput } from "@/types/pedidos";
import { useForm, useWatch } from "react-hook-form";

export const SHIPPING_COST = 75;

export function useCheckout() {
  const router = useRouter();
  const { isAuthenticated, loading, user } = useAuth();
  const { showToast } = useToast();
  const { items, subtotal, updateQuantity, removeItem, totalItems, clearCart } = useCart();

  const [error, setError] = useState<string | null>(null);
  const [paying, setPaying] = useState(false);

  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<number>(0);

  const [provincias, setProvincias] = useState<Provincia[]>([]);
  const [ciudades, setCiudades] = useState<Ciudad[]>([]);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [creatingAddress, setCreatingAddress] = useState(false);
  const {
    register: registerObservaciones,
    getValues: getObservacionesValues,
    watch: watchObservaciones,
  } = useForm<{ observaciones: string }>({
    defaultValues: {
      observaciones: "",
    },
  });
  const {
    register: registerAddress,
    handleSubmit: handleAddressSubmit,
    reset: resetAddressForm,
    setValue: setAddressValue,
    getValues: getAddressValues,
    control: addressControl,
    formState: { errors: addressErrors },
  } = useForm<CreateUserAddressPayload>({
    defaultValues: {
      cod_postal_destino: "",
      calle: "",
      altura: "",
      id_provincia: 0,
      id_ciudad: 0,
    },
  });
  const selectedProvinciaId = useWatch({
    control: addressControl,
    name: "id_provincia",
  });

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace("/login?redirect=/checkout");
    }
  }, [isAuthenticated, loading, router]);

  const loadUserAddresses = useCallback(async () => {
    if (!user?.id) {
      return;
    }

    setLoadingAddresses(true);
    setError(null);

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
  }, [user?.id]);

  useEffect(() => {
    if (!isAuthenticated || !user?.id) {
      return;
    }

    void loadUserAddresses();
  }, [isAuthenticated, loadUserAddresses, user?.id]);

  const loadProvincias = useCallback(async () => {
    try {
      const data = await locationsService.getProvincias();
      setProvincias(data);
      if (data.length > 0) {
        setAddressValue("id_provincia", data[0].id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudieron cargar provincias");
    }
  }, [setAddressValue]);

  const loadCiudadesByProvincia = useCallback(async (idProvincia: number) => {
    if (!idProvincia) {
      setCiudades([]);
      setAddressValue("id_ciudad", 0);
      return;
    }

    try {
      const data = await locationsService.getCiudadesByProvincia(idProvincia);
      setCiudades(data);
      const idCiudadActual = Number(getAddressValues("id_ciudad") ?? 0);
      const nextCiudad = data.some((city) => city.id === idCiudadActual) ? idCiudadActual : (data[0]?.id ?? 0);
      setAddressValue("id_ciudad", nextCiudad);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudieron cargar ciudades");
    }
  }, [getAddressValues, setAddressValue]);

  useEffect(() => {
    if (!isAddressModalOpen) {
      return;
    }

    if (!provincias.length) {
      void loadProvincias();
    }
  }, [isAddressModalOpen, loadProvincias, provincias.length]);

  useEffect(() => {
    if (!isAddressModalOpen) {
      return;
    }

    if (selectedProvinciaId > 0) {
      void loadCiudadesByProvincia(selectedProvinciaId);
    }
  }, [isAddressModalOpen, loadCiudadesByProvincia, selectedProvinciaId]);

  const total = useMemo(() => subtotal + SHIPPING_COST, [subtotal]);

  const updateItemQuantity = (itemId: number, quantity: number) => {
    updateQuantity(itemId, quantity);
  };

  const removeCheckoutItem = (itemId: number) => {
    removeItem(itemId);
  };

  const openAddressModal = () => {
    setError(null);
    setIsAddressModalOpen(true);
  };

  const closeAddressModal = () => {
    setIsAddressModalOpen(false);
    setCreatingAddress(false);
    resetAddressForm({
      cod_postal_destino: "",
      calle: "",
      altura: "",
      id_provincia: provincias[0]?.id ?? 0,
      id_ciudad: 0,
    });
  };

  const submitNewAddress = async (values: CreateUserAddressPayload) => {
    if (!user?.id) {
      setError("Sesión inválida para crear dirección");
      return;
    }

    if (!values.calle.trim() || !values.altura.trim() || !values.cod_postal_destino.trim()) {
      setError("Completá calle, altura y código postal");
      return;
    }

    if (!/^\d+$/.test(values.altura.trim())) {
      setError("La altura debe ser numérica");
      return;
    }

    if (!values.id_provincia || !values.id_ciudad) {
      setError("Seleccioná provincia y ciudad");
      return;
    }

    setCreatingAddress(true);
    setError(null);

    try {
      const payload: CreateUserAddressPayload = {
        cod_postal_destino: values.cod_postal_destino.trim(),
        calle: values.calle.trim(),
        altura: values.altura.trim(),
        id_provincia: Number(values.id_provincia),
        id_ciudad: Number(values.id_ciudad),
      };

      const created = await usuariosService.createUserAddress(user.id, payload);
      showToast("Dirección creada correctamente", "success");
      setAddresses((prev) => [created, ...prev]);
      setSelectedAddressId(created.id);
      closeAddressModal();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo crear la dirección");
    } finally {
      setCreatingAddress(false);
    }
  };

  const buildDetalles = async (): Promise<PedidoDetalleCreateInput[]> => {
    const missingDimensionItems = items.filter(
      (item) => item.ancho == null || item.alto == null || item.profundo == null,
    );

    const missingProductsMap = new Map<number, { ancho: number; alto: number; profundo: number }>();

    if (missingDimensionItems.length) {
      const uniqueIds = [...new Set(missingDimensionItems.map((item) => item.id))];
      const products = await Promise.all(uniqueIds.map((id) => productosService.getProductById(id)));
      for (const product of products) {
        missingProductsMap.set(product.id, {
          ancho: Number(product.ancho),
          alto: Number(product.alto),
          profundo: Number(product.profundo),
        });
      }
    }

    return items.map((item) => {
      const fallback = missingProductsMap.get(item.id);
      const ancho = Number(item.ancho ?? fallback?.ancho ?? 0);
      const alto = Number(item.alto ?? fallback?.alto ?? 0);
      const profundo = Number(item.profundo ?? fallback?.profundo ?? 0);

      return {
        id_producto: item.id,
        id_descuento: item.id_descuento ?? null,
        unidades: item.quantity,
        subtotal: Number((item.precio * item.quantity).toFixed(2)),
        ancho_producto: Math.round(ancho),
        alto_producto: Math.round(alto),
        profundo_producto: Math.round(profundo),
      };
    });
  };

  const pay = async () => {
    if (!user?.id) {
      setError("No se pudo identificar el usuario para crear el pedido");
      return;
    }

    if (!items.length) {
      setError("No hay productos en el carrito");
      return;
    }

    if (!selectedAddressId) {
      setError("Seleccioná una dirección de envío");
      return;
    }

    setPaying(true);
    setError(null);

    try {
      const detalles = await buildDetalles();

      const response = await pedidosService.createPedido({
        id_usuario: user.id,
        id_direccion: selectedAddressId,
        costo_total_productos: Number(subtotal.toFixed(2)),
        costo_envio: Number(SHIPPING_COST.toFixed(2)),
        costo_ganancia_envio: Number(subtotal.toFixed(2)) * 0.05, // 5% de comisión sobre el subtotal
        observaciones: getObservacionesValues("observaciones").trim() || null,
        detalles,
      });

      if (!response.init_point) {
        throw new Error("No se recibió URL de pago");
      }

      clearCart();
      window.location.href = response.init_point;
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo iniciar el pago");
    } finally {
      setPaying(false);
    }
  };

  return {
    isAuthenticated,
    loading,
    error,
    user,
    items,
    subtotal,
    totalItems,
    total,
    shippingCost: SHIPPING_COST,
    commissionCost: Number(subtotal.toFixed(2)) * 0.05,
    addresses,
    loadingAddresses,
    selectedAddressId,
    setSelectedAddressId,
    provincias,
    ciudades,
    isAddressModalOpen,
    creatingAddress,
    registerAddress,
    handleAddressSubmit,
    addressErrors,
    submitNewAddress,
    registerObservaciones,
    observacionesValue: watchObservaciones("observaciones"),
    paying,
    openAddressModal,
    closeAddressModal,
    pay,
    updateItemQuantity,
    removeCheckoutItem,
  };
}

