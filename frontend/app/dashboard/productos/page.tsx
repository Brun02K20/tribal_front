"use client";

import AdminOnly from "@/features/admin/components/AdminOnly";
import AdminShell from "@/features/admin/components/AdminShell";
import AdminTable from "@/features/admin/components/AdminTable";
import AdminCrudActions from "@/features/admin/components/AdminCrudActions";
import ConfirmDeleteModal from "@/features/admin/components/ConfirmDeleteModal";
import ProductFormModal from "@/features/admin/components/ProductFormModal";
import { useProductosAdmin } from "@/features/admin/hooks/useProductosAdmin";
import { formatCurrencyArs } from "@/shared/lib/formatters";
import PaginationControls from "@/shared/ui/PaginationControls";

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
    registerFilters,
    subcategoriasFiltradasPorCategoria,
    page,
    pageSize,
    totalPages,
    totalItems,
    applyFilters,
    clearFilters,
    goToPage,
    changePageSize,
  } = useProductosAdmin();

  return (
    <AdminOnly>
      <AdminShell
        title="Productos"
        subtitle="CRUD de productos con carga de imágenes por multipart/form-data."
      >
        <div className="flex items-center justify-between">
          <p className="app-subtitle">Total: {totalItems}</p>
          <button className="app-btn-primary" onClick={openCreate}>
            Crear producto
          </button>
        </div>

        <form
          className="mt-4 grid grid-cols-1 gap-3 rounded-lg border border-line p-3 md:grid-cols-5"
          onSubmit={applyFilters}
        >
          <div>
            <label className="mb-1 block text-sm text-dark-gray">Nombre</label>
            <input
              className="app-input"
              placeholder="Ej: Mate de algarrobo"
              {...registerFilters("nombre")}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-dark-gray">Categoría</label>
            <select className="app-input" {...registerFilters("id_categoria")}>
              <option value="">Todas las categorías</option>
              {categorias.map((categoria) => (
                <option key={categoria.id} value={categoria.id}>
                  {categoria.nombre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm text-dark-gray">Subcategoría</label>
            <select className="app-input" {...registerFilters("id_subcategoria")}>
              <option value="">Todas las subcategorías</option>
              {subcategoriasFiltradasPorCategoria.map((subcategoria) => (
                <option key={subcategoria.id} value={subcategoria.id}>
                  {subcategoria.nombre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm text-dark-gray">Precio mínimo</label>
            <input
              type="number"
              step="0.01"
              className="app-input"
              placeholder="Ej: 1000"
              {...registerFilters("precio_min")}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-dark-gray">Precio máximo</label>
            <input
              type="number"
              step="0.01"
              className="app-input"
              placeholder="Ej: 50000"
              {...registerFilters("precio_max")}
            />
          </div>

          <div className="md:col-span-5 flex gap-2">
            <button type="submit" className="app-btn-primary">Filtrar</button>
            <button type="button" className="app-btn-secondary" onClick={clearFilters}>Limpiar</button>
          </div>
        </form>

        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

        <AdminTable
          headers={["ID", "Nombre", "Categoría", "Subcategoría", "Precio", "Stock", "Estado", "Acciones"]}
          loading={loading}
          isEmpty={products.length === 0}
          loadingText="Cargando productos..."
          emptyText="No hay productos cargados."
          minWidthClassName="min-w-[1200px]"
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

        <PaginationControls
          page={page}
          totalPages={totalPages}
          totalItems={totalItems}
          pageSize={pageSize}
          onPageChange={goToPage}
          pageSizeOptions={[10, 15, 20]}
          onPageSizeChange={changePageSize}
        />

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

