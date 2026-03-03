'use client';

import { KeyboardEvent } from 'react';
import AdminOnly from '@/features/admin/components/AdminOnly';
import AdminShell from '@/features/admin/components/AdminShell';
import { useAdminChat } from '@/features/chat/hooks/useAdminChat';

const formatTime = (value: string) => {
  const date = new Date(value);
  return date.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
};

export default function DashboardChatPage() {
  const {
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
  } = useAdminChat();

  const onEnterPress = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      void sendMessage();
    }
  };

  return (
    <AdminOnly>
      <AdminShell title="Chat" subtitle="Mensajería en tiempo real con clientes.">
        <div className="grid min-h-[68vh] grid-cols-1 overflow-hidden rounded-lg border border-line md:grid-cols-[320px_minmax(0,1fr)]">
          <aside className="border-b border-line bg-cream md:border-b-0 md:border-r">
            <header className="border-b border-line px-4 py-3">
              <h3 className="app-title text-lg">Conversaciones</h3>
              <input
                className="app-input mt-3"
                placeholder="Buscar por nombre de cliente"
                value={conversationFilter}
                onChange={(event) => setConversationFilter(event.target.value)}
              />
            </header>

            <div className="max-h-[65vh] overflow-y-auto">
              {loading && <p className="px-4 py-3 text-sm text-dark-gray">Cargando conversaciones...</p>}
              {!loading && conversations.length === 0 && (
                <p className="px-4 py-3 text-sm text-dark-gray">No hay conversaciones todavía.</p>
              )}
              {!loading && conversations.length > 0 && filteredConversations.length === 0 && (
                <p className="px-4 py-3 text-sm text-dark-gray">No hay resultados para ese cliente.</p>
              )}

              {filteredConversations.map((conversation) => {
                const active = selectedConversationId === conversation._id;
                return (
                  <button
                    key={conversation._id}
                    type="button"
                    className={`w-full border-b border-line px-4 py-3 text-left transition ${active ? 'bg-earth-brown/10' : 'hover:bg-line'}`}
                    onClick={() => selectConversation(conversation._id)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-semibold text-black">{conversation.cliente_nombre ?? `Cliente #${conversation.cliente_id}`}</p>
                      {conversation.ultimo_mensaje_fecha && (
                        <span className="text-xs text-dark-gray">{formatTime(conversation.ultimo_mensaje_fecha)}</span>
                      )}
                    </div>
                    <div className="mt-1 flex items-center justify-between gap-2">
                      <p className="truncate text-xs text-dark-gray">{conversation.ultimo_mensaje || 'Sin mensajes'}</p>
                      {!!conversation.no_leidos && conversation.no_leidos > 0 && (
                        <span className="rounded-full bg-earth-brown px-2 py-0.5 text-xs text-cream">{conversation.no_leidos}</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </aside>

          <section className="flex min-h-[56vh] flex-col bg-cream/50">
            <header className="border-b border-line px-4 py-3">
              <h3 className="app-title text-lg">{selectedConversation?.cliente_nombre ?? 'Seleccioná una conversación'}</h3>
            </header>

            <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
              {loadingMessages && <p className="text-sm text-dark-gray">Cargando mensajes...</p>}
              {!loadingMessages && !selectedConversationId && (
                <p className="text-sm text-dark-gray">Elegí una conversación para comenzar.</p>
              )}

              {messages.map((message) => {
                const mine = message.rol === 'admin';
                return (
                  <article
                    key={message._id}
                    className={`max-w-[85%] rounded-lg px-3 py-2 ${mine ? 'ml-auto bg-earth-brown text-cream' : 'bg-line text-black'}`}
                  >
                    <p className="whitespace-pre-wrap text-sm">{message.contenido}</p>
                    <p className={`mt-1 text-right text-xs ${mine ? 'text-cream/80' : 'text-dark-gray'}`}>
                      {formatTime(message.fecha_creacion)}
                    </p>
                  </article>
                );
              })}
            </div>

            <footer className="border-t border-line px-4 py-3">
              {error && <p className="mb-2 text-sm text-red-600">{error}</p>}
              <div className="flex gap-2">
                <textarea
                  className="app-input min-h-11.5 flex-1 resize-none"
                  rows={2}
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  onKeyDown={onEnterPress}
                  placeholder="Escribí una respuesta"
                  disabled={!selectedConversationId}
                />
                <button
                  type="button"
                  className="app-btn-primary"
                  onClick={() => void sendMessage()}
                  disabled={!canSend}
                >
                  {sending ? 'Enviando...' : 'Enviar'}
                </button>
              </div>
            </footer>
          </section>
        </div>
      </AdminShell>
    </AdminOnly>
  );
}
