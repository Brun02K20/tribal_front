'use client';

import ProtectedRoute from '@/shared/providers/ProtectedRoute';
import { useClientChatPage } from '@/features/chat/hooks/useClientChatPage';

export default function ChatClientePage() {
  const {
    user,
    messages,
    draft,
    loading,
    sending,
    canSend,
    error,
    setDraft,
    sendMessage,
    onEnterPress,
    formatTime,
  } = useClientChatPage();

  if (user?.id_rol === 1) {
    return null;
  }

  return (
    <ProtectedRoute>
      <main className="app-page">
        <section className="app-container mx-auto max-w-220">
          <div className="app-panel flex min-h-[72vh] flex-col overflow-hidden p-0">
            <header className="border-b border-line px-4 py-3">
              <h1 className="app-title text-xl">Soporte</h1>
              <p className="app-subtitle mt-1">Conversación directa con administración.</p>
            </header>

            <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
              {loading && <p className="text-sm text-dark-gray">Cargando conversación...</p>}
              {!loading && messages.length === 0 && (
                <p className="text-sm text-dark-gray">Todavía no hay mensajes. Escribí el primero.</p>
              )}

              {messages.map((message) => {
                const mine = message.rol === 'cliente';
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
                  placeholder="Escribí tu mensaje"
                />
                <button
                  type="button"
                  className="app-btn-primary"
                  disabled={!canSend}
                  onClick={() => void sendMessage()}
                >
                  {sending ? 'Enviando...' : 'Enviar'}
                </button>
              </div>
            </footer>
          </div>
        </section>
      </main>
    </ProtectedRoute>
  );
}
