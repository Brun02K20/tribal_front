import apiClient, { parseApiError } from "@/shared/api/apiClient";
import type {
  CreateEncargoPayload,
  Encargo,
  GenerateEncargoPaymentLinkResponse,
  UpdatePresupuestoEncargoPayload,
} from "@/types/encargos";

const createEncargo = async (payload: CreateEncargoPayload): Promise<Encargo> => {
  try {
    const { data } = await apiClient.post<Encargo>("/encargos", payload);
    return data;
  } catch (error) {
    throw parseApiError(error, {
      fallbackMessage: "No se pudo crear el encargo",
      prefix: "Encargos",
    });
  }
};

const updatePresupuesto = async (idEncargo: number, payload: UpdatePresupuestoEncargoPayload): Promise<Encargo> => {
  try {
    const { data } = await apiClient.put<Encargo>(`/encargos/${idEncargo}/presupuesto`, payload);
    return data;
  } catch (error) {
    throw parseApiError(error, {
      fallbackMessage: "No se pudo actualizar el presupuesto del encargo",
      prefix: "Encargos",
    });
  }
};

const generatePaymentLink = async (idEncargo: number): Promise<GenerateEncargoPaymentLinkResponse> => {
  try {
    const { data } = await apiClient.post<GenerateEncargoPaymentLinkResponse>(
      `/encargos/${idEncargo}/generar-link-pago`,
      {},
    );
    return data;
  } catch (error) {
    throw parseApiError(error, {
      fallbackMessage: "No se pudo generar el link de pago del encargo",
      prefix: "Encargos",
    });
  }
};

const getMyEncargos = async (): Promise<Encargo[]> => {
  try {
    const { data } = await apiClient.get<Encargo[]>("/encargos/mis");
    return data;
  } catch (error) {
    throw parseApiError(error, {
      fallbackMessage: "No se pudieron obtener tus encargos",
      prefix: "Encargos",
    });
  }
};

const getAllEncargosForAdmin = async (): Promise<Encargo[]> => {
  try {
    const { data } = await apiClient.get<Encargo[]>("/encargos/admin/all");
    return data;
  } catch (error) {
    throw parseApiError(error, {
      fallbackMessage: "No se pudieron obtener los encargos",
      prefix: "Encargos",
    });
  }
};

export const encargosService = {
  createEncargo,
  updatePresupuesto,
  generatePaymentLink,
  getMyEncargos,
  getAllEncargosForAdmin,
};
