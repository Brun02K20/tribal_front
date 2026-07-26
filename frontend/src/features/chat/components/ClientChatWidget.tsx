'use client';

import { KeyboardEvent, useEffect, useRef, useState } from 'react';
import { useClientChat } from '@/features/chat/hooks/useClientChat';
import { useAuth } from '@/shared/providers/AuthContext';

const formatTime = (value: string) =>
  new Date(value).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });

export default function ClientChatWidget() {
  const { user, loading: authLoading } = useAuth();
  const chat = useClientChat();
  const [open, setOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (open) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chat.messages, open]);

  useEffect(() => {
    const onEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onEscape);
    return () => document.removeEventListener('keydown', onEscape);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open && window.innerWidth < 768 ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  if (authLoading || user?.id_rol === 1) {
    return null;
  }

  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      void chat.sendMessage();
    }
  };

  return (
    <aside className="fixed bottom-4 right-4 z-200 md:bottom-6 md:right-6" aria-label="Chat de soporte">
      {open && (
        <section
          className="fixed inset-0 flex flex-col overflow-hidden bg-cream shadow-2xl md:inset-auto md:bottom-24 md:right-6 md:h-[min(610px,calc(100vh-120px))] md:w-100 md:rounded-2xl md:border md:border-earth-brown/50"
          role="dialog"
          aria-modal="true"
          aria-labelledby="client-chat-title"
        >
          <header className="flex items-center justify-between border-b border-line bg-earth-brown px-4 py-3 text-cream">
            <div>
              <h2 id="client-chat-title" className="text-lg font-semibold">Soporte Tribal Trend</h2>
              <p className="text-xs text-cream/80">Conversación directa con administración</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="grid h-10 w-10 cursor-pointer place-items-center rounded-full text-2xl hover:bg-white/10"
              aria-label="Cerrar chat"
            >
              ×
            </button>
          </header>

          <div className="flex-1 space-y-3 overflow-y-auto bg-cream/95 px-4 py-4" aria-live="polite">
            {chat.loading && <p className="text-sm text-dark-gray">Cargando conversación...</p>}
            {!chat.loading && chat.messages.length === 0 && (
              <div className="rounded-xl bg-line p-3 text-sm text-black">
                ¡Hola! Estamos acá para ayudarte. Escribinos tu consulta.
              </div>
            )}
            {chat.messages.map((message) => {
              const mine = message.rol === 'cliente';
              return (
                <article
                  key={message._id}
                  className={`max-w-[86%] rounded-xl px-3 py-2 shadow-sm ${
                    mine ? 'ml-auto bg-earth-brown text-cream' : 'bg-line text-black'
                  }`}
                >
                  <p className="whitespace-pre-wrap break-words text-sm">{message.contenido}</p>
                  <p className={`mt-1 text-right text-[11px] ${mine ? 'text-cream/75' : 'text-dark-gray'}`}>
                    {formatTime(message.fecha_creacion)}
                  </p>
                </article>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          <footer className="border-t border-line bg-cream p-3">
            {chat.error && <p className="mb-2 text-xs text-red-700">{chat.error}</p>}
            <div className="flex items-end gap-2">
              <textarea
                className="app-input max-h-28 min-h-12 flex-1 resize-none"
                rows={2}
                value={chat.draft}
                onChange={(event) => chat.setDraft(event.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Escribí tu mensaje..."
                maxLength={2000}
                autoFocus
              />
              <button
                type="button"
                className="app-btn-primary h-12 shrink-0"
                disabled={!chat.canSend}
                onClick={() => void chat.sendMessage()}
              >
                {chat.sending ? '...' : 'Enviar'}
              </button>
            </div>
          </footer>
        </section>
      )}

      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="grid h-16 w-16 cursor-pointer place-items-center rounded-full border-2 border-cream bg-earth-brown text-cream shadow-xl transition hover:scale-105 hover:brightness-110"
          aria-label="Abrir chat de soporte"
          aria-expanded={open}
        >
          <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 18.5 4 21v-5.2A8 8 0 1 1 7.5 18.5Z" />
            <path strokeLinecap="round" d="M8 11h.01M12 11h.01M16 11h.01" />
          </svg>
        </button>
      )}
    </aside>
  );
}
