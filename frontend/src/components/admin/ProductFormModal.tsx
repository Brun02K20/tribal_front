"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import type { ProductFormValues } from "@/types/products";
import type { ProductFormModalProps } from "@/types/admin-ui";
import AppModal from "@/src/components/ui/AppModal";

const ACCEPTED_EXTENSIONS = ["jpg", "jpeg", "png"];
const ACCEPTED_MIME_TYPES = ["image/jpeg", "image/png"];

const isAcceptedImage = (file: File) => {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  return ACCEPTED_EXTENSIONS.includes(ext) || ACCEPTED_MIME_TYPES.includes(file.type);
};

export default function ProductFormModal({
  isOpen,
  mode,
  submitting,
  initialValues,
  selected,
  categorias,
  subcategorias,
  onClose,
  onSubmit,
}: ProductFormModalProps) {
  const isView = mode === "view";

  const {
    register,
    watch,
    reset,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm<ProductFormValues>({
    defaultValues: initialValues,
  });

  const [fileFields, setFileFields] = useState<Array<File | null>>([null]);
  const [fileError, setFileError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    reset(initialValues);
    setFileFields([null]);
    setFileError(null);
  }, [initialValues, isOpen, reset]);

  const selectedCategoryId = watch("id_categoria");

  const subcategoriasFiltradas = useMemo(
    () => subcategorias.filter((subcategoria) => subcategoria.id_categoria === Number(selectedCategoryId)),
    [selectedCategoryId, subcategorias],
  );

  useEffect(() => {
    if (!isOpen || isView) {
      return;
    }

    const currentSubcategoriaId = watch("id_subcategoria");
    const exists = subcategoriasFiltradas.some((subcategoria) => subcategoria.id === Number(currentSubcategoriaId));
    if (!exists) {
      setValue("id_subcategoria", subcategoriasFiltradas[0]?.id ?? 0);
    }
  }, [isOpen, isView, setValue, subcategoriasFiltradas, watch]);

  if (!isOpen) {
    return null;
  }

  const handleFileChange = (index: number, fileList: FileList | null) => {
    const file = fileList?.[0] ?? null;

    setFileError(null);
    setFileFields((prev) => {
      const next = [...prev];

      if (file && !isAcceptedImage(file)) {
        setFileError("Solo se permiten imágenes JPG, JPEG o PNG");
        next[index] = null;
        return next;
      }

      next[index] = file;

      const isLast = index === next.length - 1;
      if (file && isLast) {
        next.push(null);
      }

      return next;
    });
  };

  const internalSubmit = async (values: ProductFormValues) => {
    if (isView) {
      onClose();
      return;
    }

    if (fileError) {
      return;
    }

    const files = fileFields.filter((file): file is File => Boolean(file));

    if (mode === "create" && files.length < 1) {
      setFileError("Debe subir al menos una foto");
      return;
    }

    await onSubmit(values, files);
  };

  return (
    <AppModal>
      <div className="app-modal-backdrop">
        <div className="app-modal-card max-h-[90vh] max-w-2xl overflow-y-auto p-4 sm:p-5">
        <h3 className="app-title text-xl">
          {mode === "create" ? "Crear producto" : mode === "edit" ? "Editar producto" : "Ver producto"}
        </h3>

        {mode === "edit" && (
          <p className="mt-2 text-sm text-amber-700">
            NO SUBIR FOTOS SI NO QUIERE EDITAR LAS FOTOS ACTUALES DEL PRODUCTO
          </p>
        )}

        <form className="mt-4 space-y-3" onSubmit={handleSubmit(internalSubmit)}>
          <div>
            <label className="mb-1 block text-sm font-medium text-dark-gray">Nombre</label>
            <input
              className="app-input"
              disabled={isView}
              placeholder="Ej: Mate imperial"
              {...register("nombre", { required: "El nombre es obligatorio" })}
            />
            {errors.nombre && <p className="mt-1 text-sm text-red-600">{errors.nombre.message}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-dark-gray">Descripción</label>
            <textarea
              className="app-input min-h-22.5"
              disabled={isView}
              placeholder="Ej: Mate artesanal de calabaza forrado en cuero"
              {...register("descripcion", { required: "La descripción es obligatoria" })}
            />
            {errors.descripcion && <p className="mt-1 text-sm text-red-600">{errors.descripcion.message}</p>}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-dark-gray">Precio</label>
              <input
                type="number"
                step="0.01"
                className="app-input"
                disabled={isView}
                placeholder="Ej: 12000"
                {...register("precio", {
                  required: "El precio es obligatorio",
                  valueAsNumber: true,
                  min: { value: 0.01, message: "El precio debe ser mayor a 0" },
                })}
              />
              {errors.precio && <p className="mt-1 text-sm text-red-600">{errors.precio.message}</p>}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-dark-gray">Stock</label>
              <input
                type="number"
                className="app-input"
                disabled={isView}
                placeholder="Ej: 25"
                {...register("stock", {
                  required: "El stock es obligatorio",
                  valueAsNumber: true,
                  min: { value: 0, message: "El stock no puede ser negativo" },
                })}
              />
              {errors.stock && <p className="mt-1 text-sm text-red-600">{errors.stock.message}</p>}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-dark-gray">Categoría</label>
              <select
                className="app-input"
                disabled={isView}
                {...register("id_categoria", {
                  required: "La categoría es obligatoria",
                  valueAsNumber: true,
                  validate: (value) => (value > 0 ? true : "La categoría es obligatoria"),
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
              <label className="mb-1 block text-sm font-medium text-dark-gray">Subcategoría</label>
              <select
                className="app-input"
                disabled={isView}
                {...register("id_subcategoria", {
                  required: "La subcategoría es obligatoria",
                  valueAsNumber: true,
                  validate: (value) => (value > 0 ? true : "La subcategoría es obligatoria"),
                })}
              >
                <option value={0}>Seleccionar...</option>
                {subcategoriasFiltradas.map((subcategoria) => (
                  <option key={subcategoria.id} value={subcategoria.id}>
                    {subcategoria.nombre}
                  </option>
                ))}
              </select>
              {errors.id_subcategoria && <p className="mt-1 text-sm text-red-600">{errors.id_subcategoria.message}</p>}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-dark-gray">Ancho (cm)</label>
              <input
                type="number"
                step="0.01"
                className="app-input"
                disabled={isView}
                placeholder="Ej: 10"
                {...register("ancho", {
                  required: "El ancho es obligatorio",
                  valueAsNumber: true,
                  min: { value: 0.01, message: "El ancho debe ser mayor a 0" },
                })}
              />
              {errors.ancho && <p className="mt-1 text-sm text-red-600">{errors.ancho.message}</p>}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-dark-gray">Alto (cm)</label>
              <input
                type="number"
                step="0.01"
                className="app-input"
                disabled={isView}
                placeholder="Ej: 12"
                {...register("alto", {
                  required: "El alto es obligatorio",
                  valueAsNumber: true,
                  min: { value: 0.01, message: "El alto debe ser mayor a 0" },
                })}
              />
              {errors.alto && <p className="mt-1 text-sm text-red-600">{errors.alto.message}</p>}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-dark-gray">Profundo (cm)</label>
              <input
                type="number"
                step="0.01"
                className="app-input"
                disabled={isView}
                placeholder="Ej: 10"
                {...register("profundo", {
                  required: "La profundidad es obligatoria",
                  valueAsNumber: true,
                  min: { value: 0.01, message: "La profundidad debe ser mayor a 0" },
                })}
              />
              {errors.profundo && <p className="mt-1 text-sm text-red-600">{errors.profundo.message}</p>}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-dark-gray">Peso (gramos)</label>
              <input
                type="number"
                className="app-input"
                disabled={isView}
                placeholder="Ej: 450"
                {...register("peso_gramos", {
                  required: "El peso es obligatorio",
                  valueAsNumber: true,
                  min: { value: 1, message: "El peso debe ser mayor a 0" },
                })}
              />
              {errors.peso_gramos && <p className="mt-1 text-sm text-red-600">{errors.peso_gramos.message}</p>}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-dark-gray">Fotos (JPG, JPEG, PNG)</label>
            {!isView && (
              <div className="space-y-2">
                {fileFields.map((file, index) => (
                  <input
                    key={`file-input-${index}`}
                    type="file"
                    accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                    className="app-input"
                    onChange={(event) => handleFileChange(index, event.target.files)}
                  />
                ))}
              </div>
            )}

            {mode !== "create" && selected?.fotos?.length ? (
              <div className="mt-2 flex flex-wrap gap-2">
                {selected.fotos.map((foto) => (
                  <img
                    key={foto.id}
                    src={foto.url}
                    alt="Foto del producto"
                    className="h-16 w-16 rounded border border-line object-cover"
                  />
                ))}
              </div>
            ) : null}

            {fileError && <p className="mt-1 text-sm text-red-600">{fileError}</p>}
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
