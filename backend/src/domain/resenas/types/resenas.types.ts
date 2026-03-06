export type ResenaItemResponse = {
  id: number;
  id_producto: number;
  id_usuario: number;
  calificacion: number;
  fecha: string;
  es_activo: boolean;
  usuario: {
    id: number;
    nombre: string;
    username: string;
  };
};

export type ResenaDistribucionItemResponse = {
  calificacion: number;
  cantidad: number;
};

export type ResenasProductoResponse = {
  promedio: number;
  totalCalificaciones: number;
  distribucion: ResenaDistribucionItemResponse[];
  resenas: ResenaItemResponse[];
};
