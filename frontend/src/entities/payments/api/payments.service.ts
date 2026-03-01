import apiClient from "@/shared/api/apiClient";

export const createPaymentPreference = async (guestId: number, product_id: number) => {
  try {
    const response = await apiClient.post(`pagos/buywithmp/${guestId}/${product_id}`);
    console.log("Payment preference created:", response.data);
    return response.data.init_point;
  } catch (error) {
    console.error("Error creating payment preference:", error);
    throw error;
  }
};

const paymentsService = {
  createPaymentPreference,
};

export { paymentsService };