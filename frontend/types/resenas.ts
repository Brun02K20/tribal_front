export type ResenaUsuario = {
  id: number;
  nombre: string;
  username: string;
};

export type ResenaItem = {
  id: number;
  id_producto: number;
  id_usuario: number;
  calificacion: number;
  fecha: string;
  es_activo: boolean;
  usuario: ResenaUsuario;
};

export type ResenaDistribucionItem = {
  calificacion: number;
  cantidad: number;
};

export type ResenasProductoResponse = {
  promedio: number;
  totalCalificaciones: number;
  distribucion: ResenaDistribucionItem[];
  resenas: ResenaItem[];
};

export type CreateResenaPayload = {
  calificacion: number;
};
