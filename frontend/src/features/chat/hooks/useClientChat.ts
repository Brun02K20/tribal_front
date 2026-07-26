'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Socket } from 'socket.io-client';
import { chatService } from '@/entities/chat/api/chat.service';
import { createChatSocket } from '@/shared/realtime/chatSocket';
import { useAuth } from '@/shared/providers/AuthContext';
import type { ChatConversation, ChatMessage } from '@/types/chat';

export const useClientChat = () => {
  const { loading: authLoading, user } = useAuth();
  const [conversation, setConversation] = useState<ChatConversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);

  const canSend = useMemo(() => draft.trim().length > 0 && !sending, [draft, sending]);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (user?.id_rol === 1) {
      setConversation(null);
      setMessages([]);
      setLoading(false);
      return;
    }

    let mounted = true;

    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const bootstrap = await chatService.getPublicBootstrap();
        if (!mounted) {
          return;
        }

        setConversation(bootstrap.conversation);
        setMessages(bootstrap.messages);
      } catch (err) {
        if (!mounted) {
          return;
        }
        setError(err instanceof Error ? err.message : 'No se pudo cargar el chat');
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    run();

    return () => {
      mounted = false;
    };
  }, [authLoading, user?.id_rol]);

  useEffect(() => {
    if (user?.id_rol === 1 || !conversation?._id) {
      return;
    }

    const socket: Socket = createChatSocket();
    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('chat:join', { conversacion_id: conversation._id });
      socket.emit('chat:mark-read', { conversacion_id: conversation._id });
    });

    socket.on('chat:new-message', (payload: { conversacion_id: string; message: ChatMessage }) => {
      if (payload.conversacion_id !== conversation._id) {
        return;
      }

      setMessages((prev) => {
        if (prev.some((msg) => msg._id === payload.message._id)) {
          return prev;
        }
        return [...prev, payload.message];
      });
    });

    socket.on('chat:read-updated', () => {
      setMessages((prev) => prev.map((msg) => (msg.rol === 'admin' ? { ...msg, leido: true } : msg)));
    });

    return () => {
      socketRef.current = null;
      socket.disconnect();
    };
  }, [conversation?._id, user?.id_rol]);

  const sendMessage = useCallback(async () => {
    const contenido = draft.trim();
    if (!contenido || !conversation?._id || sending) {
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
        conversacion_id: conversation._id,
        contenido,
      });
      if (!response?.ok) {
        throw new Error(response?.message ?? 'No se pudo enviar el mensaje');
      }

      setDraft('');
      if (response?.message) {
        const message = response.message as ChatMessage;
        setMessages((prev) => (prev.some((msg) => msg._id === message._id) ? prev : [...prev, message]));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo enviar el mensaje');
    } finally {
      setSending(false);
    }
  }, [conversation?._id, draft, sending]);

  return {
    conversation,
    messages,
    draft,
    loading,
    sending,
    canSend,
    error,
    setDraft,
    sendMessage,
  };
};
