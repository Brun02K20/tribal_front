"use client";

import AdminOnly from "@/features/admin/components/AdminOnly";
import AdminShell from "@/features/admin/components/AdminShell";
import AdminTable from "@/features/admin/components/AdminTable";
import AdminCrudActions from "@/features/admin/components/AdminCrudActions";
import ConfirmDeleteModal from "@/features/admin/components/ConfirmDeleteModal";
import CrudFormModal from "@/features/admin/components/CrudFormModal";
import { useEstadosEnvioAdmin } from "@/features/admin/hooks/useEstadosEnvioAdmin";
import type { EstadoEnvioFormValues } from "@/types/estados-envio";

export default function EstadosEnvioAdminPage() {
  const {
    estadosEnvio,
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
    toggleEstadoEnvio,
  } = useEstadosEnvioAdmin();

  return (
    <AdminOnly>
      <AdminShell
        title="Estados de Envío"
        subtitle="Gestioná estados de envío con acciones de ver, crear, editar y borrar."
      >
        <div className="flex items-center justify-between">
          <p className="app-subtitle">Total: {estadosEnvio.length}</p>
          <button className="app-btn-primary" onClick={openCreate}>
            Crear estado
          </button>
        </div>

        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

        <AdminTable
          headers={["ID", "Nombre", "Estado", "Acciones"]}
          loading={loading}
          isEmpty={estadosEnvio.length === 0}
          loadingText="Cargando estados de envío..."
          emptyText="No hay estados de envío cargados."
        >
          {estadosEnvio.map((estado) => (
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
                  onToggle={() => toggleEstadoEnvio(estado)}
                />
              </td>
            </tr>
          ))}
        </AdminTable>

        <CrudFormModal
          isOpen={isFormModalOpen}
          mode={mode}
          title={mode === "create" ? "Crear estado de envío" : mode === "edit" ? "Editar estado de envío" : "Ver estado de envío"}
          fields={[
            {
              name: "nombre",
              label: "Nombre",
              placeholder: "Ej: En transporte",
              required: "El nombre es obligatorio",
            },
          ]}
          initialValues={initialValues}
          onClose={closeForm}
          onSubmit={(values) => submitForm(values as EstadoEnvioFormValues)}
        />

        <ConfirmDeleteModal
          isOpen={isDeleteModalOpen}
          entityLabel="estado de envío"
          entityName={selected?.nombre ?? ""}
          onCancel={closeDelete}
          onConfirm={confirmDelete}
          loading={submitting}
        />
      </AdminShell>
    </AdminOnly>
  );
}

