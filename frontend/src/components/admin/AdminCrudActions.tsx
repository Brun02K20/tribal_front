import type { AdminCrudActionsProps } from "@/types/admin-ui";

export default function AdminCrudActions({
  submitting,
  isActive,
  onView,
  onEdit,
  onDelete,
  onToggle,
}: AdminCrudActionsProps) {
  const actionButtonClassName =
    "inline-flex h-9 w-9 items-center justify-center rounded-md border border-earth-brown text-earth-brown transition hover:bg-earth-brown/10 disabled:cursor-not-allowed disabled:opacity-60";

  return (
    <div className="flex flex-nowrap items-center gap-2 whitespace-nowrap">
      <button
        className={actionButtonClassName}
        onClick={onView}
        disabled={submitting}
        type="button"
        aria-label="Ver"
        title="Ver"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6Z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      </button>
      <button
        className={actionButtonClassName}
        onClick={onEdit}
        disabled={submitting}
        type="button"
        aria-label="Editar"
        title="Editar"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="m4 20 4.5-1 9-9a2.1 2.1 0 0 0-3-3l-9 9L4 20Z" />
          <path d="m13 7 3 3" />
        </svg>
      </button>
      <button
        className={actionButtonClassName}
        onClick={onDelete}
        disabled={submitting}
        type="button"
        aria-label="Borrar"
        title="Borrar"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M3 6h18" />
          <path d="M8 6V4h8v2" />
          <path d="m6 6 1 14h10l1-14" />
          <path d="M10 10v7M14 10v7" />
        </svg>
      </button>
      <button
        className={actionButtonClassName}
        onClick={onToggle}
        disabled={submitting}
        type="button"
        aria-label={isActive ? "Desactivar" : "Activar"}
        title={isActive ? "Desactivar" : "Activar"}
      >
        {isActive ? (
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
            <circle cx="12" cy="12" r="8" />
            <path d="M9 9l6 6" />
            <path d="M15 9l-6 6" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
            <circle cx="12" cy="12" r="8" />
            <path d="M8 12h8" />
            <path d="M12 8v8" />
          </svg>
        )}
      </button>
    </div>
  );
}
