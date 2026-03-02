"use client";

import ErrorState from '@/shared/ui/ErrorState';
import LoadingState from '@/shared/ui/LoadingState';
import { useProductResenas } from '@/features/products/hooks/useProductResenas';

type ProductResenasSectionProps = {
  productId: number;
};

function Stars({ value, size = 'text-xl' }: { value: number; size?: string }) {
  return (
    <div className={`flex items-center gap-0.5 ${size}`}>
      {[1, 2, 3, 4, 5].map((index) => (
        <span key={index} className={index <= Math.round(value) ? 'text-earth-brown' : 'text-line'}>
          ★
        </span>
      ))}
    </div>
  );
}

export default function ProductResenasSection({ productId }: ProductResenasSectionProps) {
  const {
    data,
    loading,
    submitting,
    error,
    selectedRating,
    canReview,
    alreadyReviewed,
    setSelectedRating,
    submitRating,
  } = useProductResenas(productId);

  if (loading) {
    return (
      <section className="app-panel mt-6 p-4">
        <LoadingState message="Cargando reseñas del producto..." />
      </section>
    );
  }

  if (!data) {
    return (
      <section className="app-panel mt-6 p-4">
        <ErrorState message={error || 'No se pudieron cargar las reseñas'} />
      </section>
    );
  }

  const total = data.totalCalificaciones;

  return (
    <section className="app-panel mt-6 p-4">
      <h2 className="app-title text-xl">Reseñas del producto</h2>

      {error && <ErrorState message={error} className="mt-3 text-sm text-red-600" />}

      <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-[300px_1fr]">
        <article>
          <p className="app-title text-5xl">{data.promedio.toFixed(1)}</p>
          <div className="mt-2">
            <Stars value={data.promedio} size="text-2xl" />
          </div>
          <p className="app-subtitle mt-1 text-sm">{total} calificaciones</p>

          <div className="mt-4 space-y-2">
            {data.distribucion.map((item) => {
              const porcentaje = total > 0 ? Math.round((item.cantidad / total) * 100) : 0;

              return (
                <div key={item.calificacion} className="grid grid-cols-[22px_minmax(0,1fr)_36px] items-center gap-2">
                  <span className="text-sm text-dark-gray">{item.calificacion}</span>
                  <div className="h-2 rounded-full bg-line/70">
                    <div
                      className="h-2 rounded-full bg-earth-brown"
                      style={{ width: `${porcentaje}%` }}
                    />
                  </div>
                  <span className="text-right text-xs text-dark-gray">{item.cantidad}</span>
                </div>
              );
            })}
          </div>
        </article>

        <article>
          <h3 className="app-title text-lg">Tu calificación</h3>
          <p className="app-subtitle mt-1 text-sm">
            Solo podés calificar si compraste este producto al menos una vez.
          </p>

          <div className="mt-3 flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((rating) => (
              <button
                key={rating}
                type="button"
                className="text-3xl"
                onClick={() => setSelectedRating(rating)}
                disabled={!canReview || submitting}
              >
                <span className={rating <= selectedRating ? 'text-earth-brown' : 'text-line'}>★</span>
              </button>
            ))}
          </div>

          <button
            type="button"
            className="app-btn-primary mt-4"
            onClick={() => void submitRating()}
            disabled={!canReview || submitting}
          >
            {submitting ? 'Enviando...' : 'Enviar calificación'}
          </button>

          {!canReview && (
            <p className="app-subtitle mt-2 text-sm">
              {alreadyReviewed
                ? 'Ya realizaste una reseña para este producto.'
                : 'Iniciá sesión como cliente y comprá el producto para poder calificar.'}
            </p>
          )}
        </article>
      </div>

      <div className="mt-6 border-t border-line pt-4">
        <h3 className="app-title text-lg">Últimas calificaciones</h3>
        {data.resenas.length === 0 ? (
          <p className="app-subtitle mt-2 text-sm">Todavía no hay reseñas para este producto.</p>
        ) : (
          <div className="mt-3 space-y-3">
            {data.resenas.slice(0, 10).map((resena) => (
              <article key={resena.id} className="rounded-md border border-line p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="app-subtitle text-sm">Cliente verificado</p>
                  <Stars value={resena.calificacion} size="text-base" />
                </div>
                <p className="app-subtitle mt-1 text-xs">
                  {new Date(resena.fecha).toLocaleDateString('es-AR')}
                </p>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
