import apiClient from "@/shared/api/apiClient";

export type AuditEventType =
  | "USER_REGISTERED"
  | "USER_LOGIN"
  | "PRODUCT_VIEWED"
  | "PRODUCT_SEARCHED"
  | "CHECKOUT_STARTED"
  | "PAYMENT_STARTED"
  | "PAYMENT_APPROVED"
  | "ADDRESS_CREATED"
  | "ACCOUNT_UPDATED";

export type AuditEventPayload = {
  event_type: AuditEventType;
  entity_type?: string | null;
  entity_id?: number | null;
  metadata?: Record<string, unknown> | null;
};

const trackEvent = async (payload: AuditEventPayload): Promise<void> => {
  try {
    await apiClient.post("/audit/events", payload);
  } catch {
    // La auditoria no debe bloquear la experiencia del usuario.
  }
};

export const auditService = {
  trackEvent,
};
