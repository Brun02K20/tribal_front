import apiClient, { parseApiError } from '@/shared/api/apiClient';
import type { ChatConversation, ChatMessage, ClientChatBootstrap } from '@/types/chat';

const getClientBootstrap = async (): Promise<ClientChatBootstrap> => {
  try {
    const { data } = await apiClient.get<ClientChatBootstrap>('/chat/conversaciones/mia');
    return data;
  } catch (error) {
    throw parseApiError(error, {
      fallbackMessage: 'No se pudo cargar la conversación del cliente',
      prefix: 'Chat',
    });
  }
};

const getAdminConversations = async (): Promise<ChatConversation[]> => {
  try {
    const { data } = await apiClient.get<ChatConversation[]>('/chat/conversaciones');
    return data;
  } catch (error) {
    throw parseApiError(error, {
      fallbackMessage: 'No se pudo cargar la lista de conversaciones',
      prefix: 'Chat',
    });
  }
};

const getMessages = async (conversationId: string): Promise<ChatMessage[]> => {
  try {
    const { data } = await apiClient.get<ChatMessage[]>(`/chat/conversaciones/${conversationId}/mensajes`);
    return data;
  } catch (error) {
    throw parseApiError(error, {
      fallbackMessage: 'No se pudo cargar el historial de mensajes',
      prefix: 'Chat',
    });
  }
};

const sendMessage = async (payload: { contenido: string; conversacion_id?: string }) => {
  try {
    const { data } = await apiClient.post('/chat/mensajes', payload);
    return data;
  } catch (error) {
    throw parseApiError(error, {
      fallbackMessage: 'No se pudo enviar el mensaje',
      prefix: 'Chat',
    });
  }
};

const markAsRead = async (conversationId: string) => {
  try {
    await apiClient.patch(`/chat/conversaciones/${conversationId}/leido`);
  } catch (error) {
    throw parseApiError(error, {
      fallbackMessage: 'No se pudo actualizar la lectura',
      prefix: 'Chat',
    });
  }
};

export const chatService = {
  getClientBootstrap,
  getAdminConversations,
  getMessages,
  sendMessage,
  markAsRead,
};
