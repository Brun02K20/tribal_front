import type { AdminCrudActionsProps } from "@/types/admin-ui";

export default function AdminCrudActions({
  submitting,
  isActive,
  onView,
  onEdit,
  onDelete,
  onToggle,
}: AdminCrudActionsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        className="app-btn-secondary disabled:cursor-not-allowed disabled:opacity-60"
        onClick={onView}
        disabled={submitting}
      >
        Ver
      </button>
      <button
        className="app-btn-secondary disabled:cursor-not-allowed disabled:opacity-60"
        onClick={onEdit}
        disabled={submitting}
      >
        Editar
      </button>
      <button
        className="app-btn-primary disabled:cursor-not-allowed disabled:opacity-60"
        onClick={onDelete}
        disabled={submitting}
      >
        Borrar
      </button>
      <button
        className="app-btn-secondary disabled:cursor-not-allowed disabled:opacity-60"
        onClick={onToggle}
        disabled={submitting}
      >
        {isActive ? "Desactivar" : "Activar"}
      </button>
    </div>
  );
}
