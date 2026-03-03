export type ChatRole = 'cliente' | 'admin';

export type ChatMessage = {
  _id: string;
  conversacion_id: string;
  autor_id: number;
  rol: ChatRole;
  fecha_creacion: string;
  contenido: string;
  leido: boolean;
};

export type ChatConversation = {
  _id: string;
  cliente_id: number;
  cliente_nombre?: string;
  fecha_creacion: string;
  ultimo_mensaje: string;
  ultimo_mensaje_fecha?: string;
  no_leidos?: number;
};

export type ClientChatBootstrap = {
  conversation: ChatConversation;
  messages: ChatMessage[];
};
