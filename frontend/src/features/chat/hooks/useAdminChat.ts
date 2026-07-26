'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Socket } from 'socket.io-client';
import { chatService } from '@/entities/chat/api/chat.service';
import { createChatSocket } from '@/shared/realtime/chatSocket';
import { useAuth } from '@/shared/providers/AuthContext';
import type { ChatConversation, ChatMessage } from '@/types/chat';

const sortConversations = (conversations: ChatConversation[]) => {
  return [...conversations].sort((a, b) => {
    const aDate = new Date(a.ultimo_mensaje_fecha ?? a.fecha_creacion).getTime();
    const bDate = new Date(b.ultimo_mensaje_fecha ?? b.fecha_creacion).getTime();
    return bDate - aDate;
  });
};

export const useAdminChat = () => {
  const { isAuthenticated, loading: authLoading, user } = useAuth();
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [conversationFilter, setConversationFilter] = useState('');
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);

  const selectedConversation = useMemo(
    () => conversations.find((conversation) => conversation._id === selectedConversationId) ?? null,
    [conversations, selectedConversationId],
  );

  const filteredConversations = useMemo(() => {
    const query = conversationFilter.trim().toLowerCase();
    if (!query) {
      return conversations;
    }

    return conversations.filter((conversation) => {
      const nombre = (conversation.cliente_nombre ?? '').toLowerCase();
      return nombre.includes(query);
    });
  }, [conversationFilter, conversations]);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!isAuthenticated || user?.id_rol !== 1) {
      setConversations([]);
      setSelectedConversationId(null);
      setMessages([]);
      setLoading(false);
      return;
    }

    let mounted = true;

    const loadConversations = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await chatService.getAdminConversations();
        if (!mounted) {
          return;
        }

        const sorted = sortConversations(data);
        setConversations(sorted);
        setSelectedConversationId((prev) => {
          if (!prev) {
            return null;
          }

          return sorted.some((conversation) => conversation._id === prev) ? prev : null;
        });
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'No se pudo cargar el listado de chats');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadConversations();

    return () => {
      mounted = false;
    };
  }, [authLoading, isAuthenticated, user?.id_rol]);

  useEffect(() => {
    if (!isAuthenticated || user?.id_rol !== 1 || !selectedConversationId) {
      setMessages([]);
      return;
    }

    let mounted = true;
    setLoadingMessages(true);

    const loadMessages = async () => {
      try {
        const data = await chatService.getMessages(selectedConversationId);
        if (!mounted) {
          return;
        }

        setMessages(data);
        await chatService.markAsRead(selectedConversationId);
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'No se pudo cargar la conversación');
        }
      } finally {
        if (mounted) {
          setLoadingMessages(false);
        }
      }
    };

    loadMessages();

    return () => {
      mounted = false;
    };
  }, [isAuthenticated, selectedConversationId, user?.id_rol]);

  useEffect(() => {
    if (!isAuthenticated || user?.id_rol !== 1) {
      return;
    }

    const socket: Socket = createChatSocket();
    socketRef.current = socket;

    socket.on('connect', () => {
      if (selectedConversationId) {
        socket.emit('chat:join', { conversacion_id: selectedConversationId });
      }
    });

    socket.on('chat:new-message', (payload: { conversacion_id: string; message: ChatMessage }) => {
      if (payload.conversacion_id === selectedConversationId) {
        setMessages((prev) => (prev.some((msg) => msg._id === payload.message._id) ? prev : [...prev, payload.message]));
      }
    });

    socket.on('chat:conversation-updated', (payload: {
      conversacion_id: string;
      cliente_id?: number;
      cliente_nombre?: string;
      ultimo_mensaje: string;
      ultimo_mensaje_fecha: string;
      autor_rol?: 'cliente' | 'admin';
    }) => {
      setConversations((prev) => {
        const isSelected = payload.conversacion_id === selectedConversationId;
        const shouldIncrementUnread = payload.autor_rol === 'cliente' && !isSelected;

        const existingIndex = prev.findIndex((conversation) => conversation._id === payload.conversacion_id);
        if (existingIndex === -1) {
          const fallbackName = payload.cliente_id ? `Cliente #${payload.cliente_id}` : 'Cliente';
          const createdConversation: ChatConversation = {
            _id: payload.conversacion_id,
            cliente_id: Number(payload.cliente_id ?? 0),
            cliente_nombre: payload.cliente_nombre?.trim() || fallbackName,
            fecha_creacion: payload.ultimo_mensaje_fecha,
            ultimo_mensaje: payload.ultimo_mensaje,
            ultimo_mensaje_fecha: payload.ultimo_mensaje_fecha,
            no_leidos: shouldIncrementUnread ? 1 : 0,
          };

          return sortConversations([createdConversation, ...prev]);
        }

        const next = [...prev];
        const current = next[existingIndex];
        next[existingIndex] = {
          ...current,
          cliente_nombre: payload.cliente_nombre?.trim() || current.cliente_nombre,
          ultimo_mensaje: payload.ultimo_mensaje,
          ultimo_mensaje_fecha: payload.ultimo_mensaje_fecha,
          no_leidos: shouldIncrementUnread
            ? (current.no_leidos ?? 0) + 1
            : current.no_leidos,
        };

        return sortConversations(next);
      });
    });

    socket.on('chat:read-updated', (payload: { conversacion_id: string }) => {
      setConversations((prev) => prev.map((conversation) => (
        conversation._id === payload.conversacion_id
          ? { ...conversation, no_leidos: 0 }
          : conversation
      )));
      if (payload.conversacion_id === selectedConversationId) {
        setMessages((prev) => prev.map((msg) => (msg.rol === 'cliente' ? { ...msg, leido: true } : msg)));
      }
    });

    return () => {
      socketRef.current = null;
      socket.disconnect();
    };
  }, [isAuthenticated, selectedConversationId, user?.id_rol]);

  const selectConversation = useCallback((conversationId: string) => {
    setSelectedConversationId(conversationId);
    setConversations((prev) => prev.map((conversation) => (
      conversation._id === conversationId
        ? { ...conversation, no_leidos: 0 }
        : conversation
    )));
  }, []);

  const sendMessage = useCallback(async () => {
    const contenido = draft.trim();
    if (!selectedConversationId || !contenido || sending) {
      return;
    }

    setSending(true);
    setError(null);
    try {
      const socket = socketRef.current;
      if (!socket?.connected) {
        throw new Error('El chat se está conectando. Intentá nuevamente en un instante.');
      }
      const response = await socket.timeout(8000).emitWithAck('chat:send', {
        conversacion_id: selectedConversationId,
        contenido,
      });
      if (!response?.ok) {
        throw new Error(response?.message ?? 'No se pudo enviar el mensaje');
      }

      const created = response?.message as ChatMessage | undefined;
      if (created) {
        setMessages((prev) => (prev.some((msg) => msg._id === created._id) ? prev : [...prev, created]));
      }
      setDraft('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo enviar el mensaje');
    } finally {
      setSending(false);
    }
  }, [draft, selectedConversationId, sending]);

  const canSend = useMemo(() => draft.trim().length > 0 && !sending && !!selectedConversationId, [draft, sending, selectedConversationId]);

  return {
    conversations,
    filteredConversations,
    conversationFilter,
    selectedConversation,
    selectedConversationId,
    messages,
    draft,
    loading,
    loadingMessages,
    sending,
    canSend,
    error,
    setConversationFilter,
    setDraft,
    selectConversation,
    sendMessage,
  };
};
