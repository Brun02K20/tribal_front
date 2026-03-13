"use client";

import AdminOnly from "@/features/admin/components/AdminOnly";
import AdminShell from "@/features/admin/components/AdminShell";
import AdminTable from "@/features/admin/components/AdminTable";
import ConfirmDeleteModal from "@/features/admin/components/ConfirmDeleteModal";
import DescuentoFormModal from "@/features/admin/components/DescuentoFormModal";
import AdminCrudActions from "@/features/admin/components/AdminCrudActions";
import { useDescuentosAdmin } from "@/features/admin/hooks/useDescuentosAdmin";
import type { DescuentoFormValues } from "@/types/descuentos";

const formatDateTime = (value: string) => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "-";
  }

  return parsed.toLocaleString("es-AR");
};

const getReferenciaLabel = (descuento: {
  tipo: "producto" | "subcategoria" | "categoria";
  producto: { nombre: string } | null;
  subcategoria: { nombre: string } | null;
  categoria: { nombre: string } | null;
  id_producto: number | null;
  id_subcategoria: number | null;
  id_categoria: number | null;
}) => {
  if (descuento.tipo === "producto") {
    return descuento.producto?.nombre ?? `Producto #${descuento.id_producto ?? "-"}`;
  }

  if (descuento.tipo === "subcategoria") {
    return descuento.subcategoria?.nombre ?? `Subcategoría #${descuento.id_subcategoria ?? "-"}`;
  }

  return descuento.categoria?.nombre ?? `Categoría #${descuento.id_categoria ?? "-"}`;
};

export default function DescuentosAdminPage() {
  const {
    descuentos,
    categorias,
    subcategorias,
    loading,
    submitting,
    error,
    selected,
    mode,
    isFormModalOpen,
    isDeleteModalOpen,
    registerFilters,
    initialValues,
    openCreate,
    openEdit,
    openView,
    closeForm,
    openDelete,
    closeDelete,
    applyFilters,
    clearFilters,
    submitForm,
    confirmDelete,
  } = useDescuentosAdmin();

  return (
    <AdminOnly>
      <AdminShell
        title="Descuentos"
        subtitle="Creá, editá y consultá descuentos por producto, subcategoría o categoría."
      >
        <div className="rounded-lg border border-earth-brown/30 bg-earth-brown/10 p-3">
          <p className="text-sm text-dark-gray">
            Regla activa: si creás o editás un descuento para el mismo objetivo (mismo producto, subcategoría o
            categoría), se eliminan automáticamente los descuentos no finalizados de ese objetivo y queda vigente el
            nuevo descuento.
          </p>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <p className="app-subtitle">Total: {descuentos.length}</p>
          <button className="app-btn-primary" onClick={openCreate}>
            Crear descuento
          </button>
        </div>

        <form
          className="mt-4 grid grid-cols-1 gap-3 rounded-lg border border-line p-3 md:grid-cols-2"
          onSubmit={applyFilters}
        >
          <div>
            <label className="mb-1 block text-sm text-dark-gray">Estado</label>
            <select className="app-input" {...registerFilters("estado")}>
              <option value="">Todos</option>
              <option value="no_empezado">No empezados</option>
              <option value="vigente">Vigentes</option>
              <option value="terminado">Terminados</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm text-dark-gray">Tipo</label>
            <select className="app-input" {...registerFilters("tipo")}>
              <option value="">Todos</option>
              <option value="producto">Producto</option>
              <option value="subcategoria">Subcategoría</option>
              <option value="categoria">Categoría</option>
            </select>
          </div>

          <div className="md:col-span-2 flex gap-2">
            <button type="submit" className="app-btn-primary">Filtrar</button>
            <button type="button" className="app-btn-secondary" onClick={clearFilters}>Limpiar</button>
          </div>
        </form>

        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

        <AdminTable
          headers={["ID", "%", "Tipo", "Referencia", "Inicio", "Fin", "Estado", "Acciones"]}
          loading={loading}
          isEmpty={descuentos.length === 0}
          loadingText="Cargando descuentos..."
          emptyText="No hay descuentos cargados."
          minWidthClassName="min-w-[1100px]"
        >
          {descuentos.map((descuento) => (
            <tr key={descuento.id} className="border-t border-line">
              <td className="px-3 py-2">{descuento.id}</td>
              <td className="px-3 py-2">{Number(descuento.porcentaje)}%</td>
              <td className="px-3 py-2">{descuento.tipo}</td>
              <td className="px-3 py-2">{getReferenciaLabel(descuento)}</td>
              <td className="px-3 py-2">{formatDateTime(descuento.fecha_inicio)}</td>
              <td className="px-3 py-2">{formatDateTime(descuento.fecha_fin)}</td>
              <td className="px-3 py-2">{descuento.estado}</td>
              <td className="px-3 py-2">
                <AdminCrudActions
                  submitting={submitting}
                  isActive={true}
                  showToggle={false}
                  onView={() => openView(descuento)}
                  onEdit={() => openEdit(descuento)}
                  onDelete={() => openDelete(descuento)}
                  onToggle={() => undefined}
                />
              </td>
            </tr>
          ))}
        </AdminTable>

        <DescuentoFormModal
          isOpen={isFormModalOpen}
          mode={mode}
          submitting={submitting}
          selected={selected}
          initialValues={initialValues}
          categorias={categorias}
          subcategorias={subcategorias}
          onClose={closeForm}
          onSubmit={(values) => submitForm(values as DescuentoFormValues)}
        />

        <ConfirmDeleteModal
          isOpen={isDeleteModalOpen}
          entityLabel="descuento"
          entityName={`#${selected?.id ?? ""}`}
          onCancel={closeDelete}
          onConfirm={confirmDelete}
          loading={submitting}
        />
      </AdminShell>
    </AdminOnly>
  );
}
