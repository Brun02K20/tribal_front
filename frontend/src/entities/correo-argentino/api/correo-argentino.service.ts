import apiClient, { parseApiError } from '@/shared/api/apiClient';

export type ShippingRateItem = {
  deliveredType: string;
  productType: string;
  productName: string;
  price: number;
  deliveryTimeMin: string;
  deliveryTimeMax: string;
};

export type ShippingRatesResponse = {
  customerId: string;
  validTo: string;
  rates: ShippingRateItem[];
};

const getRates = async (params: {
  postalCodeDestination: string;
  weight: number;
  height: number;
  width: number;
  length: number;
}): Promise<ShippingRatesResponse> => {
  try {
    const { data } = await apiClient.get<ShippingRatesResponse>(
      '/correo-argentino/rates',
      { params },
    );
    return data;
  } catch (error) {
    throw parseApiError(error, {
      fallbackMessage: 'No se pudieron obtener las cotizaciones de envío',
      prefix: 'Envío',
    });
  }
};

export const correoArgentinoService = { getRates };