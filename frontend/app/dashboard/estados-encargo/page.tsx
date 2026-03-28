"use client";

import AdminOnly from "@/features/admin/components/AdminOnly";
import AdminShell from "@/features/admin/components/AdminShell";
import AdminTable from "@/features/admin/components/AdminTable";
import AdminCrudActions from "@/features/admin/components/AdminCrudActions";
import ConfirmDeleteModal from "@/features/admin/components/ConfirmDeleteModal";
import CrudFormModal from "@/features/admin/components/CrudFormModal";
import { useEstadosEncargoAdmin } from "@/features/admin/hooks/useEstadosEncargoAdmin";
import type { EstadoEncargoFormValues } from "@/types/estados-encargo";

export default function EstadosEncargoAdminPage() {
  const {
    estadosEncargo,
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
    toggleEstadoEncargo,
  } = useEstadosEncargoAdmin();

  return (
    <AdminOnly>
      <AdminShell
        title="Estados de Encargo"
        subtitle="Gestioná estados de encargo con acciones de ver, crear, editar y borrar."
      >
        <div className="flex items-center justify-between">
          <p className="app-subtitle">Total: {estadosEncargo.length}</p>
          <button className="app-btn-primary" onClick={openCreate}>
            Crear estado
          </button>
        </div>

        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

        <AdminTable
          headers={["ID", "Nombre", "Estado", "Acciones"]}
          loading={loading}
          isEmpty={estadosEncargo.length === 0}
          loadingText="Cargando estados de encargo..."
          emptyText="No hay estados de encargo cargados."
        >
          {estadosEncargo.map((estado) => (
            <tr key={estado.id} className="border-t border-line">
              <td className="px-3 py-2">{estado.id}</td>
              <td className="px-3 py-2">{estado.nombre}</td>
              <td className="px-3 py-2">{estado.esActivo ? "Activo" : "Inactivo"}</td>
              <td className="px-3 py-2">
                <AdminCrudActions
                  submitting={submitting}
                  isActive={estado.esActivo}
                  onView={() => openView(estado)}
                  onEdit={() => openEdit(estado)}
                  onDelete={() => openDelete(estado)}
                  onToggle={() => toggleEstadoEncargo(estado)}
                />
              </td>
            </tr>
          ))}
        </AdminTable>

        <CrudFormModal
          isOpen={isFormModalOpen}
          mode={mode}
          title={mode === "create" ? "Crear estado de encargo" : mode === "edit" ? "Editar estado de encargo" : "Ver estado de encargo"}
          fields={[
            {
              name: "nombre",
              label: "Nombre",
              placeholder: "Ej: Presupuestado",
              required: "El nombre es obligatorio",
            },
          ]}
          initialValues={initialValues}
          onClose={closeForm}
          onSubmit={(values) => submitForm(values as EstadoEncargoFormValues)}
        />

        <ConfirmDeleteModal
          isOpen={isDeleteModalOpen}
          entityLabel="estado de encargo"
          entityName={selected?.nombre ?? ""}
          onCancel={closeDelete}
          onConfirm={confirmDelete}
          loading={submitting}
        />
      </AdminShell>
    </AdminOnly>
  );
}
