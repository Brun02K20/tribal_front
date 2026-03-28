"use client";

import { KeyboardEvent, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/shared/providers/AuthContext";
import { useClientChat } from "@/features/chat/hooks/useClientChat";

export const useClientChatPage = () => {
  const router = useRouter();
  const { user } = useAuth();
  const chat = useClientChat();

  useEffect(() => {
    if (user?.id_rol === 1) {
      router.replace("/dashboard/chat");
    }
  }, [router, user?.id_rol]);

  const onEnterPress = useCallback((event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void chat.sendMessage();
    }
  }, [chat]);

  const formatTime = useCallback((value: string) => {
    const date = new Date(value);
    return date.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });
  }, []);

  return {
    ...chat,
    user,
    onEnterPress,
    formatTime,
  };
};
