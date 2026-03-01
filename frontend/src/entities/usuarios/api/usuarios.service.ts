import apiClient, { parseApiError } from "@/shared/api/apiClient";
import type {
  AccountConfigResponse,
  CreateUserAddressPayload,
  UpdateAccountConfigPayload,
  UpdateAccountConfigResponse,
  UserAddress,
} from "@/types/usuarios";

const getUserAddresses = async (userId: number): Promise<UserAddress[]> => {
  try {
    const { data } = await apiClient.get<UserAddress[]>(`/usuarios/${userId}/direcciones`);
    return data;
  } catch (error) {
    throw parseApiError(error, {
      fallbackMessage: "No se pudieron obtener las direcciones",
      prefix: "Usuarios",
    });
  }
};

const createUserAddress = async (
  userId: number,
  payload: CreateUserAddressPayload,
): Promise<UserAddress> => {
  try {
    const { data } = await apiClient.post<UserAddress>(`/usuarios/${userId}/direcciones`, payload);
    return data;
  } catch (error) {
    throw parseApiError(error, {
      fallbackMessage: "No se pudo crear la dirección",
      prefix: "Usuarios",
    });
  }
};

const getAccountConfig = async (userId: number): Promise<AccountConfigResponse> => {
  try {
    const { data } = await apiClient.get<AccountConfigResponse>(`/usuarios/get-config/${userId}`);
    return data;
  } catch (error) {
    throw parseApiError(error, {
      fallbackMessage: "No se pudo obtener la configuración de la cuenta",
      prefix: "Usuarios",
    });
  }
};

const updateAccountConfig = async (
  userId: number,
  payload: UpdateAccountConfigPayload,
): Promise<UpdateAccountConfigResponse> => {
  try {
    const { data } = await apiClient.put<UpdateAccountConfigResponse>(
      `/usuarios/update-config?userId=${userId}`,
      payload,
    );
    return data;
  } catch (error) {
    throw parseApiError(error, {
      fallbackMessage: "No se pudo actualizar la configuración de la cuenta",
      prefix: "Usuarios",
    });
  }
};

export const usuariosService = {
  getUserAddresses,
  createUserAddress,
  getAccountConfig,
  updateAccountConfig,
};
