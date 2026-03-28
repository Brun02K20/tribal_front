export type EncargoEstado = {
  id: number;
  nombre: string;
};

export type EncargoUsuario = {
  id: number;
  nombre: string;
  email: string;
};

export type Encargo = {
  id: number;
  id_usuario: number;
  id_direccion: number;
  fecha_encargo: string;
  presupuesto: number | null;
  ancho: number | null;
  alto: number | null;
  profundo: number | null;
  peso_en_gramos: number | null;
  descripcion: string;
  id_estado: number;
  estado_encargo?: EncargoEstado;
  usuario?: EncargoUsuario;
  direccion?: {
    id: number;
    calle: string;
    altura: string;
    cod_postal_destino: string;
  };
};

export type CreateEncargoPayload = {
  id_direccion: number;
  descripcion: string;
};

export type UpdatePresupuestoEncargoPayload = {
  ancho: number;
  alto: number;
  profundo: number;
  peso_en_gramos: number;
  presupuesto: number;
};

export type GenerateEncargoPaymentLinkResponse = {
  init_point: string;
  email_sent_to: string;
};
