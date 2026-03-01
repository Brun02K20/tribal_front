"use client";

import AdminOnly from "@/features/admin/components/AdminOnly";
import AdminShell from "@/features/admin/components/AdminShell";
import AdminTable from "@/features/admin/components/AdminTable";
import AdminCrudActions from "@/features/admin/components/AdminCrudActions";
import ConfirmDeleteModal from "@/features/admin/components/ConfirmDeleteModal";
import CrudFormModal from "@/features/admin/components/CrudFormModal";
import { useCategoriasAdmin } from "@/features/admin/hooks/useCategoriasAdmin";
import type { CategoriaFormValues } from "@/types/categorias";

export default function CategoriasAdminPage() {
  const {
    categorias,
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
    toggleCategoria,
  } = useCategoriasAdmin();

  return (
    <AdminOnly>
      <AdminShell title="Categorías" subtitle="Gestioná categorías con acciones de ver, crear, editar y borrar.">
        <div className="flex items-center justify-between">
          <p className="app-subtitle">Total: {categorias.length}</p>
          <button className="app-btn-primary" onClick={openCreate}>
            Crear categoría
          </button>
        </div>

        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

        <AdminTable
          headers={["ID", "Nombre", "Estado", "Acciones"]}
          loading={loading}
          isEmpty={categorias.length === 0}
          loadingText="Cargando categorías..."
          emptyText="No hay categorías cargadas."
        >
          {categorias.map((categoria) => (
            <tr key={categoria.id} className="border-t border-line">
              <td className="px-3 py-2">{categoria.id}</td>
              <td className="px-3 py-2">{categoria.nombre}</td>
              <td className="px-3 py-2">{categoria.esActivo ? "Activa" : "Inactiva"}</td>
              <td className="px-3 py-2">
                <AdminCrudActions
                  submitting={submitting}
                  isActive={categoria.esActivo}
                  onView={() => openView(categoria)}
                  onEdit={() => openEdit(categoria)}
                  onDelete={() => openDelete(categoria)}
                  onToggle={() => toggleCategoria(categoria)}
                />
              </td>
            </tr>
          ))}
        </AdminTable>

        <CrudFormModal
          isOpen={isFormModalOpen}
          mode={mode}
          title={mode === "create" ? "Crear categoría" : mode === "edit" ? "Editar categoría" : "Ver categoría"}
          fields={[
            {
              name: "nombre",
              label: "Nombre",
              placeholder: "Ej: Mates",
              required: "El nombre es obligatorio",
            },
          ]}
          initialValues={initialValues}
          onClose={closeForm}
          onSubmit={(values) => submitForm(values as CategoriaFormValues)}
        />

        <ConfirmDeleteModal
          isOpen={isDeleteModalOpen}
          entityLabel="categoria"
          entityName={selected?.nombre ?? ""}
          onCancel={closeDelete}
          onConfirm={confirmDelete}
          loading={submitting}
        />
      </AdminShell>
    </AdminOnly>
  );
}

