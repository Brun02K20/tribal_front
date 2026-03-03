export type ChatUserPayload = {
  sub: number;
  id_rol: number;
  email?: string;
  nombre?: string;
};

export type SendMessageInput = {
  conversacion_id?: string;
  contenido: string;
  autor_id: number;
  rol: 'cliente' | 'admin';
};
