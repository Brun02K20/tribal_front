'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Socket } from 'socket.io-client';
import { chatService } from '@/entities/chat/api/chat.service';
import { createChatSocket } from '@/shared/realtime/chatSocket';
import { useAuth } from '@/shared/providers/AuthContext';
import type { ChatConversation, ChatMessage } from '@/types/chat';

export const useClientChat = () => {
  const { token, isAuthenticated, loading: authLoading, user } = useAuth();
  const [conversation, setConversation] = useState<ChatConversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSend = useMemo(() => draft.trim().length > 0 && !sending, [draft, sending]);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!isAuthenticated || user?.id_rol !== 2) {
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
        const bootstrap = await chatService.getClientBootstrap();
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
  }, [authLoading, isAuthenticated, user?.id_rol]);

  useEffect(() => {
    if (!isAuthenticated || user?.id_rol !== 2 || !token || !conversation?._id) {
      return;
    }

    const socket: Socket = createChatSocket(token);

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
      socket.disconnect();
    };
  }, [conversation?._id, isAuthenticated, token, user?.id_rol]);

  const sendMessage = useCallback(async () => {
    const contenido = draft.trim();
    if (!contenido || !conversation?._id || sending) {
      return;
    }

    setSending(true);
    setError(null);

    try {
      const response = await chatService.sendMessage({
        contenido,
        conversacion_id: conversation._id,
      });

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
