"use client";

import AdminOnly from "@/src/components/admin/AdminOnly";
import AdminShell from "@/src/components/admin/AdminShell";
import AdminTable from "@/src/components/admin/AdminTable";
import AdminCrudActions from "@/src/components/admin/AdminCrudActions";
import ConfirmDeleteModal from "@/src/components/admin/ConfirmDeleteModal";
import ProductFormModal from "@/src/components/admin/ProductFormModal";
import { useProductosAdmin } from "@/src/hooks/useProductosAdmin";
import { formatCurrencyArs } from "@/src/utils/formatters";

export default function ProductosAdminPage() {
  const {
    products,
    categorias,
    subcategorias,
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
    submitProduct,
    confirmDelete,
    toggleProduct,
  } = useProductosAdmin();

  return (
    <AdminOnly>
      <AdminShell
        title="Productos"
        subtitle="CRUD de productos con carga de imágenes por multipart/form-data."
      >
        <div className="flex items-center justify-between">
          <p className="app-subtitle">Total: {products.length}</p>
          <button className="app-btn-primary" onClick={openCreate}>
            Crear producto
          </button>
        </div>

        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

        <AdminTable
          headers={["ID", "Nombre", "Categoría", "Subcategoría", "Precio", "Stock", "Estado", "Acciones"]}
          loading={loading}
          isEmpty={products.length === 0}
          loadingText="Cargando productos..."
          emptyText="No hay productos cargados."
          minWidthClassName="min-w-275"
        >
          {products.map((product) => (
            <tr key={product.id} className="border-t border-line">
              <td className="px-3 py-2">{product.id}</td>
              <td className="px-3 py-2">{product.nombre}</td>
              <td className="px-3 py-2">{product.categoria?.nombre ?? "-"}</td>
              <td className="px-3 py-2">{product.subcategoria?.nombre ?? "-"}</td>
              <td className="px-3 py-2">{formatCurrencyArs(product.precio)}</td>
              <td className="px-3 py-2">{product.stock}</td>
              <td className="px-3 py-2">{product.es_activo ? "Activo" : "Inactivo"}</td>
              <td className="px-3 py-2">
                <AdminCrudActions
                  submitting={submitting}
                  isActive={product.es_activo}
                  onView={() => openView(product)}
                  onEdit={() => openEdit(product)}
                  onDelete={() => openDelete(product)}
                  onToggle={() => toggleProduct(product)}
                />
              </td>
            </tr>
          ))}
        </AdminTable>

        <ProductFormModal
          isOpen={isFormModalOpen}
          mode={mode}
          submitting={submitting}
          initialValues={initialValues}
          selected={selected}
          categorias={categorias}
          subcategorias={subcategorias}
          onClose={closeForm}
          onSubmit={submitProduct}
        />

        <ConfirmDeleteModal
          isOpen={isDeleteModalOpen}
          entityLabel="producto"
          entityName={selected?.nombre ?? ""}
          onCancel={closeDelete}
          onConfirm={confirmDelete}
          loading={submitting}
        />
      </AdminShell>
    </AdminOnly>
  );
}
