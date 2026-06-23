"use client";

import { useState, useMemo } from "react";
import AdminOnly from "@/features/admin/components/AdminOnly";
import AdminShell from "@/features/admin/components/AdminShell";
import AdminTable from "@/features/admin/components/AdminTable";
import AdminCrudActions from "@/features/admin/components/AdminCrudActions";
import ConfirmDeleteModal from "@/features/admin/components/ConfirmDeleteModal";
import ProductFormModal from "@/features/admin/components/ProductFormModal";
import DisenosModal from "@/features/admin/components/DisenosModal";
import AppModal from "@/shared/ui/AppModal";
import { useProductosAdmin } from "@/features/admin/hooks/useProductosAdmin";
import { productosService } from "@/entities/productos/api/productos.service";
import { useToast } from "@/shared/providers/ToastContext";
import { formatCurrencyArs } from "@/shared/lib/formatters";
import PaginationControls from "@/shared/ui/PaginationControls";

export default function ProductosAdminPage() {
  const { showToast } = useToast();
  const [isOrdenModalOpen, setIsOrdenModalOpen] = useState(false);
  const [ordenCategoria, setOrdenCategoria] = useState<string>("");
  const [ordenSubcategoria, setOrdenSubcategoria] = useState<string>("");
  const [ordenSubmitting, setOrdenSubmitting] = useState(false);

  const {
    products,
    categorias,
    subcategorias,
    loading,
    submitting,
    error,
    selected,
    selectedForDesigns,
    disenos,
    loadingDisenos,
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
    openDesigns,
    closeDesigns,
    submitProduct,
    confirmDelete,
    toggleProduct,
    createDiseno,
    updateDiseno,
    deleteDiseno,
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

  const subcategoriasDelOrden = useMemo(
    () => subcategorias.filter((s) => s.id_categoria === Number(ordenCategoria)),
    [subcategorias, ordenCategoria],
  );

  const openOrdenModal = async () => {
    try {
      const config = await productosService.getOrdenConfig();
      setOrdenCategoria(config?.id_categoria ? String(config.id_categoria) : "");
      setOrdenSubcategoria(config?.id_subcategoria ? String(config.id_subcategoria) : "");
    } catch {
      setOrdenCategoria("");
      setOrdenSubcategoria("");
    }
    setIsOrdenModalOpen(true);
  };

  const handleOrdenCategoriaChange = (value: string) => {
    setOrdenCategoria(value);
    setOrdenSubcategoria("");
  };

  const saveOrdenConfig = async () => {
    setOrdenSubmitting(true);
    try {
      await productosService.setOrdenConfig({
        id_categoria: ordenCategoria ? Number(ordenCategoria) : null,
        id_subcategoria: ordenCategoria && ordenSubcategoria ? Number(ordenSubcategoria) : null,
      });
      showToast("Configuración de orden guardada", "success");
      setIsOrdenModalOpen(false);
    } catch {
      showToast("Error guardando configuración", "error");
    } finally {
      setOrdenSubmitting(false);
    }
  };

  return (
    <AdminOnly>
      <AdminShell
        title="Productos"
        subtitle="CRUD de productos con carga de imágenes por multipart/form-data."
      >
        <div className="flex items-center justify-between">
          <p className="app-subtitle">Total: {totalItems}</p>
          <div className="flex gap-2">
            <button className="app-btn-secondary" onClick={openOrdenModal}>
              Ordenar
            </button>
            <button className="app-btn-primary" onClick={openCreate}>
              Crear producto
            </button>
          </div>
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
          headers={["ID", "Nombre", "Categoría", "Subcategoría", "Precio", "Stock", "Tipo", "Estado", "Acciones"]}
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
              <td className="px-3 py-2">{product.es_unico ? "Único" : "Múltiples diseños"}</td>
              <td className="px-3 py-2">{product.es_activo ? "Activo" : "Inactivo"}</td>
              <td className="px-3 py-2">
                <AdminCrudActions
                  submitting={submitting}
                  isActive={product.es_activo}
                  onView={() => openView(product)}
                  onEdit={() => openEdit(product)}
                  onDelete={() => openDelete(product)}
                  onToggle={() => toggleProduct(product)}
                  onDesigns={() => openDesigns(product)}
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

        <DisenosModal
          isOpen={Boolean(selectedForDesigns)}
          product={selectedForDesigns}
          disenos={disenos}
          loading={loadingDisenos}
          submitting={submitting}
          error={error}
          onClose={closeDesigns}
          onCreate={createDiseno}
          onUpdate={updateDiseno}
          onDelete={deleteDiseno}
        />

        {isOrdenModalOpen && (
          <AppModal>
            <div className="app-modal-backdrop">
              <div className="app-modal-card max-w-md p-5">
                <h3 className="app-title text-xl mb-1">Configurar orden de productos</h3>
                <p className="text-sm text-zinc-500 mb-4">
                  Los productos de la categoría/subcategoría seleccionada aparecerán primero en todas las vistas.
                </p>

                <div className="space-y-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium">Categoría prioritaria</label>
                    <select
                      className="app-input"
                      value={ordenCategoria}
                      onChange={(e) => handleOrdenCategoriaChange(e.target.value)}
                    >
                      <option value="">Sin prioridad (orden por defecto)</option>
                      {categorias.map((c) => (
                        <option key={c.id} value={c.id}>{c.nombre}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium">Subcategoría prioritaria</label>
                    <select
                      className="app-input disabled:cursor-not-allowed disabled:opacity-50"
                      value={ordenSubcategoria}
                      onChange={(e) => setOrdenSubcategoria(e.target.value)}
                      disabled={!ordenCategoria}
                    >
                      <option value="">Sin prioridad de subcategoría</option>
                      {subcategoriasDelOrden.map((s) => (
                        <option key={s.id} value={s.id}>{s.nombre}</option>
                      ))}
                    </select>
                    {!ordenCategoria && (
                      <p className="mt-1 text-xs text-zinc-400">Seleccioná una categoría primero</p>
                    )}
                  </div>
                </div>

                <div className="mt-6 flex justify-end gap-2">
                  <button
                    type="button"
                    className="app-btn-secondary"
                    onClick={() => setIsOrdenModalOpen(false)}
                    disabled={ordenSubmitting}
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    className="app-btn-primary"
                    onClick={saveOrdenConfig}
                    disabled={ordenSubmitting}
                  >
                    {ordenSubmitting ? "Guardando..." : "Guardar"}
                  </button>
                </div>
              </div>
            </div>
          </AppModal>
        )}
      </AdminShell>
    </AdminOnly>
  );
}

