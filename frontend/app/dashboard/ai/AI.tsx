"use client";

import AdminShell from "@/features/admin/components/AdminShell";
import { useAdminAiSummary } from "@/features/admin/hooks/useAdminAiSummary";
import ErrorState from "@/shared/ui/ErrorState";
import LoadingState from "@/shared/ui/LoadingState";

export default function AI() {
  const { summary, loading, error, refresh } = useAdminAiSummary();

  return (
    <AdminShell
      title="AI"
      subtitle="Resumen administrativo y sugerencias de acción para el ecommerce."
    >
      <section className="relative space-y-4">
        <article className="app-panel p-4">
          <h3 className="app-title text-lg">Resumen administrativo AI</h3>
          <p className="app-subtitle mt-3 text-sm">
            Este módulo genera un resumen de lo ocurrido en el ecommerce durante los últimos 3 días
            y propone acciones concretas para mejorar la operación, la atención al cliente y la
            rentabilidad.
          </p>
          <p className="app-subtitle mt-2 text-sm">
            Importante: esta acción solo se puede usar una vez al día.
          </p>

          <div className="mt-4">
            <button
              type="button"
              className="app-btn-primary"
              onClick={() => void refresh()}
              disabled={loading}
            >
              {loading ? "GENERANDO..." : "GENERAR"}
            </button>
          </div>
        </article>

        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-cream/80 backdrop-blur-sm">
            <LoadingState message="Cargando informacion..." />
          </div>
        )}

        {error && <ErrorState message={error} />}

        {summary && (
          <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <article className="app-panel p-4">
              <h3 className="app-title text-lg">Qué ocurrió</h3>
              {summary.ocurrio.length === 0 ? (
                <p className="app-subtitle mt-3 text-sm">Sin novedades para el período analizado.</p>
              ) : (
                <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-dark-gray">
                  {summary.ocurrio.map((item, index) => (
                    <li key={`ocurrio-${index}`}>{item}</li>
                  ))}
                </ul>
              )}
            </article>

            <article className="app-panel p-4">
              <h3 className="app-title text-lg">Acciones a realizar</h3>
              {summary.acciones.length === 0 ? (
                <p className="app-subtitle mt-3 text-sm">Sin acciones sugeridas para el período analizado.</p>
              ) : (
                <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-dark-gray">
                  {summary.acciones.map((item, index) => (
                    <li key={`acciones-${index}`}>{item}</li>
                  ))}
                </ul>
              )}
            </article>
          </section>
        )}
      </section>
    </AdminShell>
  );
}
