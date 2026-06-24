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
  const [ordenSubmitting, setOrdenSubmitting] = useState(false);
  const [reindexando, setReindexando] = useState(false);

  const reindexar = async () => {
    if (!confirm("¿Reindexar todos los productos? Esto puede tardar unos minutos según la cantidad de productos.")) return;
    setReindexando(true);
    try {
      const { data } = await (await import("@/shared/api/apiClient")).default.post<{ total: number; indexados: number }>("/productos/admin/reindexar");
      showToast(`Reindexado: ${data.indexados}/${data.total} productos`, "success");
    } catch {
      showToast("Error al reindexar. ¿Ollama está corriendo?", "error");
    } finally {
      setReindexando(false);
    }
  };

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

  type OrdenItem = { id_categoria: number; subcategorias: number[] };

  const [ordenItems, setOrdenItems] = useState<OrdenItem[]>([]);

  const categoriaIdsEnUso = useMemo(() => new Set(ordenItems.map((i) => i.id_categoria)), [ordenItems]);

  const openOrdenModal = async () => {
    try {
      const config = await productosService.getOrdenConfig();
      setOrdenItems(config.map((c) => ({
        id_categoria: c.id_categoria,
        subcategorias: c.subcategorias.sort((a, b) => a.posicion - b.posicion).map((s) => s.id_subcategoria),
      })));
    } catch {
      setOrdenItems([]);
    }
    setIsOrdenModalOpen(true);
  };

  const addOrdenCategoria = (id: number) => {
    setOrdenItems((prev) => [...prev, { id_categoria: id, subcategorias: [] }]);
  };

  const removeOrdenCategoria = (index: number) => {
    setOrdenItems((prev) => prev.filter((_, i) => i !== index));
  };

  const moveOrdenCategoria = (index: number, dir: -1 | 1) => {
    setOrdenItems((prev) => {
      const next = [...prev];
      const target = index + dir;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const addSubcatToOrden = (catIndex: number, idSubcat: number) => {
    setOrdenItems((prev) => prev.map((item, i) =>
      i === catIndex ? { ...item, subcategorias: [...item.subcategorias, idSubcat] } : item,
    ));
  };

  const removeSubcatFromOrden = (catIndex: number, subcatIndex: number) => {
    setOrdenItems((prev) => prev.map((item, i) =>
      i === catIndex ? { ...item, subcategorias: item.subcategorias.filter((_, j) => j !== subcatIndex) } : item,
    ));
  };

  const moveSubcat = (catIndex: number, subcatIndex: number, dir: -1 | 1) => {
    setOrdenItems((prev) => prev.map((item, i) => {
      if (i !== catIndex) return item;
      const next = [...item.subcategorias];
      const target = subcatIndex + dir;
      if (target < 0 || target >= next.length) return item;
      [next[subcatIndex], next[target]] = [next[target], next[subcatIndex]];
      return { ...item, subcategorias: next };
    }));
  };

  const saveOrdenConfig = async () => {
    setOrdenSubmitting(true);
    try {
      const payload = ordenItems.map((item, i) => ({
        id_categoria: item.id_categoria,
        posicion: i + 1,
        subcategorias: item.subcategorias.map((id_sub, j) => ({ id_subcategoria: id_sub, posicion: j + 1 })),
      }));
      await productosService.setOrdenConfig(payload);
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
            <button className="app-btn-secondary text-sm" onClick={() => void reindexar()} disabled={reindexando}>
              {reindexando ? "Reindexando..." : "Reindexar búsqueda"}
            </button>
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
              <div className="app-modal-card max-w-lg p-5 max-h-[90vh] overflow-y-auto">
                <h3 className="app-title text-xl mb-1">Configurar orden de productos</h3>
                <p className="text-sm text-zinc-500 mb-4">
                  Definí qué categorías y subcategorías aparecen primero. Podés agregar varias categorías y ordenarlas entre sí.
                </p>

                {/* Lista de categorías configuradas */}
                <div className="space-y-3">
                  {ordenItems.map((item, catIdx) => {
                    const catInfo = categorias.find((c) => c.id === item.id_categoria);
                    const subcatsDisponibles = subcategorias.filter(
                      (s) => s.id_categoria === item.id_categoria && !item.subcategorias.includes(s.id),
                    );
                    return (
                      <div key={item.id_categoria} className="rounded-lg border border-line p-3">
                        {/* Header de categoría */}
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-zinc-400 w-5">{catIdx + 1}.</span>
                          <span className="flex-1 text-sm font-semibold">{catInfo?.nombre ?? `Categoría ${item.id_categoria}`}</span>
                          <button type="button" onClick={() => moveOrdenCategoria(catIdx, -1)} disabled={catIdx === 0} className="text-zinc-400 hover:text-zinc-700 disabled:opacity-30 text-xs px-1">▲</button>
                          <button type="button" onClick={() => moveOrdenCategoria(catIdx, 1)} disabled={catIdx === ordenItems.length - 1} className="text-zinc-400 hover:text-zinc-700 disabled:opacity-30 text-xs px-1">▼</button>
                          <button type="button" onClick={() => removeOrdenCategoria(catIdx)} className="text-red-400 hover:text-red-600 text-xs px-1">✕</button>
                        </div>

                        {/* Subcategorías de esta categoría */}
                        <div className="mt-2 ml-5 space-y-1">
                          {item.subcategorias.map((idSub, subIdx) => {
                            const subInfo = subcategorias.find((s) => s.id === idSub);
                            return (
                              <div key={idSub} className="flex items-center gap-2 text-sm text-zinc-600">
                                <span className="text-xs text-zinc-400 w-4">{subIdx + 1}.</span>
                                <span className="flex-1">{subInfo?.nombre ?? `Subcat ${idSub}`}</span>
                                <button type="button" onClick={() => moveSubcat(catIdx, subIdx, -1)} disabled={subIdx === 0} className="text-zinc-400 hover:text-zinc-700 disabled:opacity-30 text-xs px-1">▲</button>
                                <button type="button" onClick={() => moveSubcat(catIdx, subIdx, 1)} disabled={subIdx === item.subcategorias.length - 1} className="text-zinc-400 hover:text-zinc-700 disabled:opacity-30 text-xs px-1">▼</button>
                                <button type="button" onClick={() => removeSubcatFromOrden(catIdx, subIdx)} className="text-red-400 hover:text-red-600 text-xs px-1">✕</button>
                              </div>
                            );
                          })}

                          {/* Agregar subcategoría */}
                          {subcatsDisponibles.length > 0 && (
                            <select
                              className="app-input text-xs mt-1"
                              value=""
                              onChange={(e) => { if (e.target.value) addSubcatToOrden(catIdx, Number(e.target.value)); }}
                            >
                              <option value="">+ Agregar subcategoría</option>
                              {subcatsDisponibles.map((s) => (
                                <option key={s.id} value={s.id}>{s.nombre}</option>
                              ))}
                            </select>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Agregar categoría */}
                {categorias.filter((c) => !categoriaIdsEnUso.has(c.id)).length > 0 && (
                  <div className="mt-3">
                    <select
                      className="app-input text-sm"
                      value=""
                      onChange={(e) => { if (e.target.value) addOrdenCategoria(Number(e.target.value)); }}
                    >
                      <option value="">+ Agregar categoría</option>
                      {categorias.filter((c) => !categoriaIdsEnUso.has(c.id)).map((c) => (
                        <option key={c.id} value={c.id}>{c.nombre}</option>
                      ))}
                    </select>
                  </div>
                )}

                {ordenItems.length === 0 && (
                  <p className="mt-3 text-sm text-zinc-400 text-center">Sin orden configurado — los productos se ordenan por fecha de creación.</p>
                )}

                <div className="mt-6 flex justify-end gap-2">
                  <button type="button" className="app-btn-secondary" onClick={() => setIsOrdenModalOpen(false)} disabled={ordenSubmitting}>
                    Cancelar
                  </button>
                  <button type="button" className="app-btn-primary" onClick={saveOrdenConfig} disabled={ordenSubmitting}>
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

