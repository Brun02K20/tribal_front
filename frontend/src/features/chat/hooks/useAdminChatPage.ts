"use client";

import { KeyboardEvent, useCallback } from "react";
import { useAdminChat } from "@/features/chat/hooks/useAdminChat";

export const useAdminChatPage = () => {
  const chat = useAdminChat();

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
    onEnterPress,
    formatTime,
  };
};
