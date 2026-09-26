"use client";

import ErrorState from '@/shared/ui/ErrorState';
import { IconStar } from '@/shared/ui/Icons';
import type { useProductResenas } from '@/features/products/hooks/useProductResenas';

type ResenasState = ReturnType<typeof useProductResenas>;

type ProductResenasSectionProps = {
  resenas: ResenasState;
};

export function Stars({ value, className = 'h-5 w-5' }: { value: number; className?: string }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${value.toFixed(1)} de 5 estrellas`}>
      {[1, 2, 3, 4, 5].map((index) => (
        <IconStar
          key={index}
          filled={index <= Math.round(value)}
          className={`${className} ${index <= Math.round(value) ? 'text-mustard' : 'text-line'}`}
        />
      ))}
    </span>
  );
}

// Resumen compacto para mostrar junto al nombre del producto.
export function RatingSummary({ resenas }: ProductResenasSectionProps) {
  const total = resenas.data?.totalCalificaciones ?? 0;
  if (!resenas.data || total === 0) {
    return null;
  }

  return (
    <a href="#resenas" className="inline-flex items-center gap-2 text-sm text-dark-gray hover:text-earth-brown">
      <Stars value={resenas.data.promedio} className="h-4 w-4" />
      <span>
        <strong className="text-black">{resenas.data.promedio.toFixed(1)}</strong> · {total} {total === 1 ? 'reseña' : 'reseñas'}
      </span>
    </a>
  );
}

export default function ProductResenasSection({ resenas }: ProductResenasSectionProps) {
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
  } = resenas;

  if (loading) {
    return (
      <section id="resenas" className="mt-16 scroll-mt-24">
        <div className="app-skeleton h-40 rounded-3xl" />
      </section>
    );
  }

  if (!data) {
    return error ? (
      <section id="resenas" className="mt-16 scroll-mt-24">
        <ErrorState message={error} className="text-sm text-red-600" />
      </section>
    ) : null;
  }

  const total = data.totalCalificaciones;

  return (
    <section id="resenas" className="mt-16 scroll-mt-24" aria-labelledby="resenas-title">
      <p className="app-kicker">Opiniones</p>
      <h2 id="resenas-title" className="app-display mt-1 text-3xl">
        {total > 0 ? 'Lo que dicen quienes ya la tienen' : 'Reseñas'}
      </h2>

      {error && <ErrorState message={error} className="mt-3 text-sm text-red-600" />}

      {total === 0 ? (
        <p className="mt-4 rounded-2xl border border-dashed border-earth-brown/40 bg-white/60 p-5 text-sm text-dark-gray">
          Todavía no hay reseñas de esta pieza. ¡Podés ser la primera persona en tenerla y contarnos qué te pareció!
        </p>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-[280px_1fr]">
          <article className="rounded-3xl border border-line bg-white/80 p-6 text-center">
            <p className="app-display text-6xl">{data.promedio.toFixed(1)}</p>
            <div className="mt-2 flex justify-center">
              <Stars value={data.promedio} className="h-6 w-6" />
            </div>
            <p className="mt-1 text-sm text-dark-gray">{total} {total === 1 ? 'calificación' : 'calificaciones'}</p>

            <div className="mt-5 space-y-2">
              {data.distribucion.map((item) => {
                const porcentaje = total > 0 ? Math.round((item.cantidad / total) * 100) : 0;

                return (
                  <div key={item.calificacion} className="grid grid-cols-[22px_minmax(0,1fr)_28px] items-center gap-2">
                    <span className="text-sm text-dark-gray">{item.calificacion}</span>
                    <div className="h-2 rounded-full bg-line/70">
                      <div className="h-2 rounded-full bg-mustard" style={{ width: `${porcentaje}%` }} />
                    </div>
                    <span className="text-right text-xs text-dark-gray">{item.cantidad}</span>
                  </div>
                );
              })}
            </div>
          </article>

          <div className="grid content-start gap-3 sm:grid-cols-2">
            {data.resenas.slice(0, 6).map((resena) => (
              <article key={resena.id} className="rounded-2xl border border-line bg-white/80 p-4">
                <Stars value={resena.calificacion} className="h-4 w-4" />
                <p className="mt-2 text-sm font-semibold text-black">Compra verificada</p>
                <p className="text-xs text-dark-gray">{new Date(resena.fecha).toLocaleDateString('es-AR')}</p>
              </article>
            ))}
          </div>
        </div>
      )}

      {(canReview || alreadyReviewed) && (
        <div className="mt-6 flex flex-wrap items-center gap-4 rounded-2xl border border-line bg-white/80 p-5">
          {alreadyReviewed ? (
            <p className="text-sm text-dark-gray">¡Gracias! Ya calificaste esta pieza.</p>
          ) : (
            <>
              <div>
                <p className="font-semibold">¿Ya la tenés? Calificala</p>
                <p className="text-xs text-dark-gray">Solo podés calificar piezas que compraste.</p>
              </div>
              <div className="flex items-center gap-1" role="radiogroup" aria-label="Tu calificación">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    type="button"
                    role="radio"
                    aria-checked={rating === selectedRating}
                    aria-label={`${rating} ${rating === 1 ? 'estrella' : 'estrellas'}`}
                    onClick={() => setSelectedRating(rating)}
                    disabled={submitting}
                  >
                    <IconStar
                      filled={rating <= selectedRating}
                      className={`h-8 w-8 ${rating <= selectedRating ? 'text-mustard' : 'text-line'}`}
                    />
                  </button>
                ))}
              </div>
              <button type="button" className="app-btn-primary" onClick={() => void submitRating()} disabled={submitting}>
                {submitting ? 'Enviando...' : 'Enviar calificación'}
              </button>
            </>
          )}
        </div>
      )}
    </section>
  );
}
