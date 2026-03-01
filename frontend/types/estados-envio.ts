export type EstadoEnvio = {
  id: number;
  nombre: string;
  esActivo: boolean;
};

export type EstadoEnvioFormValues = {
  nombre: string;
};

export type EstadoEnvioCreatePayload = {
  nombre: string;
};

export type EstadoEnvioUpdatePayload = {
  nombre: string;
};

export type SuccessDeleteEstadoEnvioResponse = {
  id: number;
  message: string;
};
