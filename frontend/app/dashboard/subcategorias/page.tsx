"use client";

import AdminOnly from "@/src/components/admin/AdminOnly";
import AdminShell from "@/src/components/admin/AdminShell";
import AdminTable from "@/src/components/admin/AdminTable";
import AdminCrudActions from "@/src/components/admin/AdminCrudActions";
import ConfirmDeleteModal from "@/src/components/admin/ConfirmDeleteModal";
import CrudFormModal from "@/src/components/admin/CrudFormModal";
import { useSubcategoriasAdmin } from "@/src/hooks/useSubcategoriasAdmin";
import type { SubcategoriaFormValues } from "@/types/subcategorias";

export default function SubcategoriasAdminPage() {
  const {
    subcategorias,
    categoriasOptions,
    categoriaMap,
    loading,
    submitting,
    error,
    selected,
    mode,
    isFormModalOpen,
    isDeleteModalOpen,
    initialValues,
    openCreate,
    openEdit,
    openView,
    closeForm,
    openDelete,
    closeDelete,
    submitForm,
    confirmDelete,
    toggleSubcategoria,
  } = useSubcategoriasAdmin();

  return (
    <AdminOnly>
      <AdminShell
        title="Subcategorías"
        subtitle="Gestioná subcategorías con acciones de ver, crear, editar y borrar."
      >
        <div className="flex items-center justify-between">
          <p className="app-subtitle">Total: {subcategorias.length}</p>
          <button className="app-btn-primary" onClick={openCreate}>
            Crear subcategoría
          </button>
        </div>

        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

        <AdminTable
          headers={["ID", "Nombre", "Categoría", "Estado", "Acciones"]}
          loading={loading}
          isEmpty={subcategorias.length === 0}
          loadingText="Cargando subcategorías..."
          emptyText="No hay subcategorías cargadas."
        >
          {subcategorias.map((subcategoria) => (
            <tr key={subcategoria.id} className="border-t border-line">
              <td className="px-3 py-2">{subcategoria.id}</td>
              <td className="px-3 py-2">{subcategoria.nombre}</td>
              <td className="px-3 py-2">{categoriaMap.get(subcategoria.id_categoria) ?? "-"}</td>
              <td className="px-3 py-2">{subcategoria.esActivo ? "Activa" : "Inactiva"}</td>
              <td className="px-3 py-2">
                <AdminCrudActions
                  submitting={submitting}
                  isActive={subcategoria.esActivo}
                  onView={() => openView(subcategoria)}
                  onEdit={() => openEdit(subcategoria)}
                  onDelete={() => openDelete(subcategoria)}
                  onToggle={() => toggleSubcategoria(subcategoria)}
                />
              </td>
            </tr>
          ))}
        </AdminTable>

        <CrudFormModal
          isOpen={isFormModalOpen}
          mode={mode}
          title={
            mode === "create"
              ? "Crear subcategoría"
              : mode === "edit"
                ? "Editar subcategoría"
                : "Ver subcategoría"
          }
          fields={[
            {
              name: "nombre",
              label: "Nombre",
              placeholder: "Ej: Bombillas",
              required: "El nombre es obligatorio",
            },
            {
              name: "id_categoria",
              label: "Categoría",
              type: "select",
              options: categoriasOptions,
              required: "La categoría es obligatoria",
            },
          ]}
          initialValues={initialValues}
          onClose={closeForm}
          onSubmit={(values) => submitForm(values as SubcategoriaFormValues)}
        />

        <ConfirmDeleteModal
          isOpen={isDeleteModalOpen}
          entityLabel="subcategoria"
          entityName={selected?.nombre ?? ""}
          onCancel={closeDelete}
          onConfirm={confirmDelete}
          loading={submitting}
        />
      </AdminShell>
    </AdminOnly>
  );
}
