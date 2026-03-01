"use client";

import AdminOnly from "@/src/components/admin/AdminOnly";
import AdminShell from "@/src/components/admin/AdminShell";
import AdminTable from "@/src/components/admin/AdminTable";
import AdminCrudActions from "@/src/components/admin/AdminCrudActions";
import ConfirmDeleteModal from "@/src/components/admin/ConfirmDeleteModal";
import CrudFormModal from "@/src/components/admin/CrudFormModal";
import { useEstadosPedidoAdmin } from "@/src/hooks/useEstadosPedidoAdmin";
import type { EstadoPedidoFormValues } from "@/types/estados-pedido";

export default function EstadosPedidoAdminPage() {
  const {
    estadosPedido,
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
    toggleEstadoPedido,
  } = useEstadosPedidoAdmin();

  return (
    <AdminOnly>
      <AdminShell
        title="Estados de Pedido"
        subtitle="Gestioná estados de pedido con acciones de ver, crear, editar y borrar."
      >
        <div className="flex items-center justify-between">
          <p className="app-subtitle">Total: {estadosPedido.length}</p>
          <button className="app-btn-primary" onClick={openCreate}>
            Crear estado
          </button>
        </div>

        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

        <AdminTable
          headers={["ID", "Nombre", "Estado", "Acciones"]}
          loading={loading}
          isEmpty={estadosPedido.length === 0}
          loadingText="Cargando estados de pedido..."
          emptyText="No hay estados de pedido cargados."
        >
          {estadosPedido.map((estado) => (
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
                  onToggle={() => toggleEstadoPedido(estado)}
                />
              </td>
            </tr>
          ))}
        </AdminTable>

        <CrudFormModal
          isOpen={isFormModalOpen}
          mode={mode}
          title={mode === "create" ? "Crear estado de pedido" : mode === "edit" ? "Editar estado de pedido" : "Ver estado de pedido"}
          fields={[
            {
              name: "nombre",
              label: "Nombre",
              placeholder: "Ej: En preparación",
              required: "El nombre es obligatorio",
            },
          ]}
          initialValues={initialValues}
          onClose={closeForm}
          onSubmit={(values) => submitForm(values as EstadoPedidoFormValues)}
        />

        <ConfirmDeleteModal
          isOpen={isDeleteModalOpen}
          entityLabel="estado de pedido"
          entityName={selected?.nombre ?? ""}
          onCancel={closeDelete}
          onConfirm={confirmDelete}
          loading={submitting}
        />
      </AdminShell>
    </AdminOnly>
  );
}
