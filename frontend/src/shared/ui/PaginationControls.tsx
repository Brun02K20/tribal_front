"use client";

type PaginationControlsProps = {
  page: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  pageSizeOptions?: number[];
  onPageSizeChange?: (pageSize: number) => void;
};

export default function PaginationControls({
  page,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  pageSizeOptions,
  onPageSizeChange,
}: PaginationControlsProps) {
  if (totalPages <= 0) {
    return null;
  }

  return (
    <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
      <div className="text-sm app-subtitle">
        Página {page} de {Math.max(totalPages, 1)} · {totalItems} resultados
      </div>

      <div className="flex items-center gap-2">
        {pageSizeOptions && onPageSizeChange && (
          <div>
            <label className="mb-1 block text-xs text-dark-gray">Resultados por página</label>
            <select
              className="app-input w-32"
              value={pageSize}
              onChange={(event) => onPageSizeChange(Number(event.target.value))}
            >
              {pageSizeOptions.map((option) => (
                <option key={option} value={option}>
                  {option}/pag
                </option>
              ))}
            </select>
          </div>
        )}

        <button
          type="button"
          className="app-btn-secondary"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
        >
          Anterior
        </button>
        <button
          type="button"
          className="app-btn-secondary"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
        >
          Siguiente
        </button>
      </div>
    </div>
  );
}
