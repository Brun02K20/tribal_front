"use client";

import AdminOnly from "@/src/components/admin/AdminOnly";
import AdminShell from "@/src/components/admin/AdminShell";
import AdminTable from "@/src/components/admin/AdminTable";
import AdminCrudActions from "@/src/components/admin/AdminCrudActions";
import ConfirmDeleteModal from "@/src/components/admin/ConfirmDeleteModal";
import ProductFormModal from "@/src/components/admin/ProductFormModal";
import { useProductosAdmin } from "@/src/hooks/useProductosAdmin";
import { formatCurrencyArs } from "@/src/utils/formatters";
import PaginationControls from "@/src/components/ui/PaginationControls";

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
    filtersForm,
    subcategoriasFiltradasPorCategoria,
    page,
    pageSize,
    totalPages,
    totalItems,
    updateFilterField,
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

        <div className="mt-4 grid grid-cols-1 gap-3 rounded-lg border border-line p-3 md:grid-cols-5">
          <div>
            <label className="mb-1 block text-sm text-dark-gray">Nombre</label>
            <input
              className="app-input"
              placeholder="Ej: Mate de algarrobo"
              value={filtersForm.nombre}
              onChange={(event) => updateFilterField("nombre", event.target.value)}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-dark-gray">Categoría</label>
            <select
              className="app-input"
              value={filtersForm.id_categoria}
              onChange={(event) => updateFilterField("id_categoria", event.target.value)}
            >
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
            <select
              className="app-input"
              value={filtersForm.id_subcategoria}
              onChange={(event) => updateFilterField("id_subcategoria", event.target.value)}
            >
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
              value={filtersForm.precio_min}
              onChange={(event) => updateFilterField("precio_min", event.target.value)}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-dark-gray">Precio máximo</label>
            <input
              type="number"
              step="0.01"
              className="app-input"
              placeholder="Ej: 50000"
              value={filtersForm.precio_max}
              onChange={(event) => updateFilterField("precio_max", event.target.value)}
            />
          </div>

          <div className="md:col-span-5 flex gap-2">
            <button type="button" className="app-btn-primary" onClick={applyFilters}>Filtrar</button>
            <button type="button" className="app-btn-secondary" onClick={clearFilters}>Limpiar</button>
          </div>
        </div>

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
