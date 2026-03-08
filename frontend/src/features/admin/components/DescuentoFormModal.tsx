"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import AppModal from "@/shared/ui/AppModal";
import { productosService } from "@/entities/productos/api/productos.service";
import type { CategoriaWithSubcategorias } from "@/types/categorias";
import type { Descuento, DescuentoFormValues, DescuentoTipo } from "@/types/descuentos";
import type { Product } from "@/types/products";
import type { Subcategoria } from "@/types/subcategorias";
import type { CrudModalMode } from "@/types/admin-ui";

type DescuentoFormInternalValues = {
  porcentaje: number;
  tipo: "" | DescuentoTipo;
  id_categoria: number;
  id_subcategoria: number;
  id_producto: number;
  fecha_inicio: string;
  fecha_fin: string;
};

type DescuentoFormModalProps = {
  isOpen: boolean;
  mode: CrudModalMode;
  submitting: boolean;
  selected: Descuento | null;
  initialValues: DescuentoFormValues;
  categorias: CategoriaWithSubcategorias[];
  subcategorias: Subcategoria[];
  onClose: () => void;
  onSubmit: (values: DescuentoFormValues) => Promise<void>;
};

const buildInitialInternalValues = (values: DescuentoFormValues): DescuentoFormInternalValues => ({
  porcentaje: Number(values.porcentaje ?? 1),
  tipo: values.tipo,
  id_categoria: values.tipo === "categoria" ? Number(values.id_referencia ?? 0) : 0,
  id_subcategoria: values.tipo === "subcategoria" ? Number(values.id_referencia ?? 0) : 0,
  id_producto: values.tipo === "producto" ? Number(values.id_referencia ?? 0) : 0,
  fecha_inicio: values.fecha_inicio,
  fecha_fin: values.fecha_fin,
});

export default function DescuentoFormModal({
  isOpen,
  mode,
  submitting,
  selected,
  initialValues,
  categorias,
  subcategorias,
  onClose,
  onSubmit,
}: DescuentoFormModalProps) {
  const isView = mode === "view";

  const {
    register,
    watch,
    reset,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm<DescuentoFormInternalValues>({
    defaultValues: buildInitialInternalValues(initialValues),
  });

  const [productsByCategory, setProductsByCategory] = useState<Record<number, Product[]>>({});
  const [productsLoading, setProductsLoading] = useState(false);
  const [productsError, setProductsError] = useState<string | null>(null);

  const selectedTipo = watch("tipo");
  const selectedCategoriaId = Number(watch("id_categoria"));
  const selectedProductId = Number(watch("id_producto"));

  const loadProductsByCategory = async (categoryId: number) => {
    if (!Number.isInteger(categoryId) || categoryId < 1) {
      return;
    }

    if (productsByCategory[categoryId]) {
      return;
    }

    setProductsLoading(true);
    setProductsError(null);

    try {
      const products = await productosService.getProductsByCategory(categoryId);
      setProductsByCategory((prev) => ({
        ...prev,
        [categoryId]: products,
      }));
    } catch (err) {
      setProductsError(err instanceof Error ? err.message : "No se pudieron cargar los productos");
    } finally {
      setProductsLoading(false);
    }
  };

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    reset(buildInitialInternalValues(initialValues));
    setProductsError(null);
  }, [initialValues, isOpen, reset]);

  useEffect(() => {
    if (!isOpen || selectedTipo !== "producto") {
      return;
    }

    const productId = Number(watch("id_producto"));
    if (!Number.isInteger(productId) || productId < 1) {
      return;
    }

    const hydrate = async () => {
      try {
        const product = await productosService.getProductById(productId);
        const categoryId = Number(product.categoria?.id ?? 0);
        if (Number.isInteger(categoryId) && categoryId > 0) {
          setValue("id_categoria", categoryId);
          await loadProductsByCategory(categoryId);
        }
      } catch {
        // Ignore hydration errors; user can still select category/product manually.
      }
    };

    void hydrate();
  }, [isOpen, selectedTipo, selected, setValue, watch]);

  useEffect(() => {
    if (!isOpen || selectedTipo !== "producto") {
      return;
    }

    if (!Number.isInteger(selectedCategoriaId) || selectedCategoriaId < 1) {
      return;
    }

    void loadProductsByCategory(selectedCategoriaId);
  }, [isOpen, selectedCategoriaId, selectedTipo]);

  useEffect(() => {
    if (!isOpen || isView) {
      return;
    }

    if (selectedTipo === "producto") {
      setValue("id_subcategoria", 0);
      return;
    }

    if (selectedTipo === "subcategoria") {
      setValue("id_categoria", 0);
      setValue("id_producto", 0);
      return;
    }

    if (selectedTipo === "categoria") {
      setValue("id_subcategoria", 0);
      setValue("id_producto", 0);
      return;
    }

    setValue("id_categoria", 0);
    setValue("id_subcategoria", 0);
    setValue("id_producto", 0);
  }, [isOpen, isView, selectedTipo, setValue]);

  const productsOptions = useMemo(
    () => productsByCategory[selectedCategoriaId] ?? [],
    [productsByCategory, selectedCategoriaId],
  );

  const productsOptionsWithSelected = useMemo(() => {
    if (!Number.isInteger(selectedProductId) || selectedProductId < 1) {
      return productsOptions;
    }

    const exists = productsOptions.some((product) => product.id === selectedProductId);
    if (exists) {
      return productsOptions;
    }

    if (selected?.id_producto === selectedProductId && selected.producto?.nombre) {
      const fallback: Product = {
        id: selectedProductId,
        nombre: selected.producto.nombre,
        descripcion: "",
        precio: 0,
        stock: 0,
        ancho: 0,
        alto: 0,
        profundo: 0,
        peso_gramos: 0,
        es_activo: true,
        categoria: { id: selectedCategoriaId || 0, nombre: "" },
        subcategoria: { id: 0, nombre: "" },
        fotos: [],
      };

      return [fallback, ...productsOptions];
    }

    return productsOptions;
  }, [productsOptions, selected, selectedCategoriaId, selectedProductId]);

  if (!isOpen) {
    return null;
  }

  const submitInternal = async (values: DescuentoFormInternalValues) => {
    if (isView) {
      onClose();
      return;
    }

    if (!values.tipo) {
      return;
    }

    let idReferencia = 0;
    if (values.tipo === "producto") {
      idReferencia = Number(values.id_producto);
    } else if (values.tipo === "subcategoria") {
      idReferencia = Number(values.id_subcategoria);
    } else {
      idReferencia = Number(values.id_categoria);
    }

    await onSubmit({
      porcentaje: Number(values.porcentaje),
      tipo: values.tipo,
      id_referencia: idReferencia,
      fecha_inicio: values.fecha_inicio,
      fecha_fin: values.fecha_fin,
    });
  };

  return (
    <AppModal>
      <div className="app-modal-backdrop">
        <div className="app-modal-card max-w-xl p-4 sm:p-5">
          <h3 className="app-title text-xl">
            {mode === "create" ? "Crear descuento" : mode === "edit" ? "Editar descuento" : "Ver descuento"}
          </h3>

          <form className="mt-4 space-y-3" onSubmit={handleSubmit(submitInternal)}>
            <div>
              <label className="mb-1 block text-sm font-medium text-dark-gray">Porcentaje</label>
              <input
                type="number"
                step="0.01"
                min={0.01}
                max={100}
                className="app-input"
                disabled={isView}
                {...register("porcentaje", {
                  required: "El porcentaje es obligatorio",
                  valueAsNumber: true,
                  min: { value: 0.01, message: "Debe ser mayor a 0" },
                  max: { value: 100, message: "No puede superar 100" },
                })}
              />
              {errors.porcentaje && <p className="mt-1 text-sm text-red-600">{errors.porcentaje.message}</p>}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-dark-gray">Tipo de descuento</label>
              <select
                className="app-input"
                disabled={isView}
                {...register("tipo", {
                  required: "Debe seleccionar un tipo de descuento",
                })}
              >
                <option value="">Seleccionar...</option>
                <option value="producto">Producto</option>
                <option value="subcategoria">Subcategoría</option>
                <option value="categoria">Categoría</option>
              </select>
              {errors.tipo && <p className="mt-1 text-sm text-red-600">{errors.tipo.message}</p>}
            </div>

            {selectedTipo === "producto" && (
              <>
                <div>
                  <label className="mb-1 block text-sm font-medium text-dark-gray">Categoría</label>
                  <select
                    className="app-input"
                    disabled={isView}
                    {...register("id_categoria", {
                      valueAsNumber: true,
                      validate: (value) => (selectedTipo !== "producto" || Number(value) > 0 ? true : "Debe seleccionar una categoría"),
                    })}
                  >
                    <option value={0}>Seleccionar...</option>
                    {categorias.map((categoria) => (
                      <option key={categoria.id} value={categoria.id}>
                        {categoria.nombre}
                      </option>
                    ))}
                  </select>
                  {errors.id_categoria && <p className="mt-1 text-sm text-red-600">{errors.id_categoria.message}</p>}
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-dark-gray">Producto</label>
                  <select
                    className="app-input"
                    disabled={isView || !selectedCategoriaId || productsLoading}
                    {...register("id_producto", {
                      valueAsNumber: true,
                      validate: (value) => (selectedTipo !== "producto" || Number(value) > 0 ? true : "Debe seleccionar un producto"),
                    })}
                  >
                    <option value={0}>{productsLoading ? "Cargando productos..." : "Seleccionar..."}</option>
                    {productsOptionsWithSelected.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.nombre}
                      </option>
                    ))}
                  </select>
                  {errors.id_producto && <p className="mt-1 text-sm text-red-600">{errors.id_producto.message}</p>}
                  {productsError && <p className="mt-1 text-sm text-red-600">{productsError}</p>}
                </div>
              </>
            )}

            {selectedTipo === "subcategoria" && (
              <div>
                <label className="mb-1 block text-sm font-medium text-dark-gray">Subcategoría</label>
                <select
                  className="app-input"
                  disabled={isView}
                  {...register("id_subcategoria", {
                    valueAsNumber: true,
                    validate: (value) => (selectedTipo !== "subcategoria" || Number(value) > 0 ? true : "Debe seleccionar una subcategoría"),
                  })}
                >
                  <option value={0}>Seleccionar...</option>
                  {subcategorias.map((subcategoria) => (
                    <option key={subcategoria.id} value={subcategoria.id}>
                      {subcategoria.nombre}
                    </option>
                  ))}
                </select>
                {errors.id_subcategoria && <p className="mt-1 text-sm text-red-600">{errors.id_subcategoria.message}</p>}
              </div>
            )}

            {selectedTipo === "categoria" && (
              <div>
                <label className="mb-1 block text-sm font-medium text-dark-gray">Categoría</label>
                <select
                  className="app-input"
                  disabled={isView}
                  {...register("id_categoria", {
                    valueAsNumber: true,
                    validate: (value) => (selectedTipo !== "categoria" || Number(value) > 0 ? true : "Debe seleccionar una categoría"),
                  })}
                >
                  <option value={0}>Seleccionar...</option>
                  {categorias.map((categoria) => (
                    <option key={categoria.id} value={categoria.id}>
                      {categoria.nombre}
                    </option>
                  ))}
                </select>
                {errors.id_categoria && <p className="mt-1 text-sm text-red-600">{errors.id_categoria.message}</p>}
              </div>
            )}

            <div>
              <label className="mb-1 block text-sm font-medium text-dark-gray">Fecha inicio</label>
              <input
                type="datetime-local"
                className="app-input"
                disabled={isView}
                {...register("fecha_inicio", { required: "La fecha de inicio es obligatoria" })}
              />
              {errors.fecha_inicio && <p className="mt-1 text-sm text-red-600">{errors.fecha_inicio.message}</p>}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-dark-gray">Fecha fin</label>
              <input
                type="datetime-local"
                className="app-input"
                disabled={isView}
                {...register("fecha_fin", {
                  required: "La fecha de fin es obligatoria",
                  validate: (value, allValues) => {
                    const start = new Date(allValues.fecha_inicio);
                    const end = new Date(value);

                    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
                      return "Fechas inválidas";
                    }

                    return end > start ? true : "La fecha fin debe ser mayor a la fecha inicio";
                  },
                })}
              />
              {errors.fecha_fin && <p className="mt-1 text-sm text-red-600">{errors.fecha_fin.message}</p>}
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button type="button" className="app-btn-secondary" onClick={onClose}>
                {isView ? "Volver" : "Cancelar"}
              </button>

              {!isView && (
                <button type="submit" className="app-btn-primary" disabled={submitting}>
                  {mode === "create" ? "Crear" : "Guardar"}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </AppModal>
  );
}
