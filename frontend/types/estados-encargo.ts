export type EstadoEncargo = {
  id: number;
  nombre: string;
  esActivo: boolean;
};

export type EstadoEncargoFormValues = {
  nombre: string;
};

export type EstadoEncargoCreatePayload = {
  nombre: string;
};

export type EstadoEncargoUpdatePayload = {
  nombre: string;
};

export type SuccessDeleteEstadoEncargoResponse = {
  id: number;
  message: string;
};
