"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import type { ProductFormValues } from "@/types/products";
import type { ProductFormModalProps } from "@/types/admin-ui";
import AppModal from "@/shared/ui/AppModal";

const ACCEPTED_EXTENSIONS = ["jpg", "jpeg", "png"];
const ACCEPTED_MIME_TYPES = ["image/jpeg", "image/png"];

type GalleryItem =
  | { id: string; type: "existing"; url: string }
  | { id: string; type: "new"; file: File; previewUrl: string };

const isAcceptedImage = (file: File) => {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  return ACCEPTED_EXTENSIONS.includes(ext) || ACCEPTED_MIME_TYPES.includes(file.type);
};

const getGalleryUrl = (item: GalleryItem) => (item.type === "existing" ? item.url : item.previewUrl);

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

  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [activeGalleryIndex, setActiveGalleryIndex] = useState(0);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    reset(initialValues);
    setGalleryItems(
      mode === "create"
        ? []
        : (selected?.fotos ?? []).map((foto) => ({
            id: `existing-${foto.id}`,
            type: "existing" as const,
            url: foto.url,
          })),
    );
    setActiveGalleryIndex(0);
    setFileError(null);
  }, [initialValues, isOpen, mode, reset, selected?.fotos]);

  useEffect(() => {
    return () => {
      galleryItems.forEach((item) => {
        if (item.type === "new") {
          URL.revokeObjectURL(item.previewUrl);
        }
      });
    };
  }, [galleryItems]);

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

  const handleFileChange = (fileList: FileList | null) => {
    const files = Array.from(fileList ?? []);
    if (!files.length) {
      return;
    }

    setFileError(null);
    const rejected = files.find((file) => !isAcceptedImage(file));
    if (rejected) {
      setFileError("Solo se permiten imágenes JPG, JPEG o PNG");
      return;
    }

    const nextItems: GalleryItem[] = files.map((file) => ({
      id: `new-${file.name}-${file.size}-${file.lastModified}-${crypto.randomUUID()}`,
      type: "new",
      file,
      previewUrl: URL.createObjectURL(file),
    }));

    setGalleryItems((prev) => [...prev, ...nextItems]);
  };

  const removeGalleryItem = (index: number) => {
    setGalleryItems((prev) => {
      const item = prev[index];
      if (item?.type === "new") {
        URL.revokeObjectURL(item.previewUrl);
      }

      const next = prev.filter((_, itemIndex) => itemIndex !== index);
      setActiveGalleryIndex((current) => Math.min(current, Math.max(next.length - 1, 0)));
      return next;
    });
  };

  const moveGalleryItem = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) {
      return;
    }

    setGalleryItems((prev) => {
      const next = [...prev];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });
    setActiveGalleryIndex(toIndex);
  };

  const handleDrop = (dropIndex: number) => {
    if (dragIndex !== null) {
      moveGalleryItem(dragIndex, dropIndex);
    }
    setDragIndex(null);
    setOverIndex(null);
  };

  const internalSubmit = async (values: ProductFormValues) => {
    if (isView) {
      onClose();
      return;
    }

    if (fileError) {
      return;
    }

    if (galleryItems.length < 1) {
      setFileError("Debe subir al menos una foto");
      return;
    }

    const files: File[] = [];
    const photoOrder = galleryItems.map((item) => {
      if (item.type === "existing") {
        return { type: "existing" as const, url: item.url };
      }

      const fileIndex = files.length;
      files.push(item.file);
      return { type: "new" as const, fileIndex };
    });

    await onSubmit(values, files, photoOrder);
  };

  const activeGalleryItem = galleryItems[Math.min(activeGalleryIndex, Math.max(galleryItems.length - 1, 0))];
  const activeGalleryUrl = activeGalleryItem ? getGalleryUrl(activeGalleryItem) : "";

  return (
    <AppModal>
      <div className="app-modal-backdrop">
        <div className="app-modal-card max-h-[90vh] max-w-2xl overflow-y-auto p-4 sm:p-5">
          <h3 className="app-title text-xl">
            {mode === "create" ? "Crear producto" : mode === "edit" ? "Editar producto" : "Ver producto"}
          </h3>

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

            <label className="flex items-start gap-3 rounded-md border border-line p-3 text-sm">
              <input type="checkbox" className="mt-1" disabled={isView} {...register("es_unico")} />
              <span>
                <span className="block font-medium text-dark-gray">Producto único</span>
                <span className="app-subtitle block text-xs">
                  Si está desmarcado, cada foto representa un diseño elegible por el comprador.
                </span>
              </span>
            </label>

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
                <input
                  type="file"
                  multiple
                  accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                  className="app-input"
                  onChange={(event) => {
                    handleFileChange(event.target.files);
                    event.currentTarget.value = "";
                  }}
                />
              )}

              {galleryItems.length ? (
                <div className="mt-3 rounded-lg border border-line bg-white/70 p-3">
                  {activeGalleryUrl && (
                    <div className="relative flex h-60 items-center justify-center rounded-md border border-earth-brown/30 bg-white">
                      <button
                        type="button"
                        className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/90 px-2 py-1 text-sm font-bold text-earth-brown shadow disabled:opacity-40"
                        onClick={() => setActiveGalleryIndex((prev) => (prev === 0 ? galleryItems.length - 1 : prev - 1))}
                        disabled={galleryItems.length <= 1}
                      >
                        {"<"}
                      </button>
                      <img src={activeGalleryUrl} alt="Preview de foto" className="h-full w-full object-contain p-2" />
                      <button
                        type="button"
                        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/90 px-2 py-1 text-sm font-bold text-earth-brown shadow disabled:opacity-40"
                        onClick={() => setActiveGalleryIndex((prev) => (prev === galleryItems.length - 1 ? 0 : prev + 1))}
                        disabled={galleryItems.length <= 1}
                      >
                        {">"}
                      </button>
                    </div>
                  )}

                  <div className="mt-3 flex gap-3 overflow-x-auto pb-2">
                    {galleryItems.map((item, index) => {
                      const url = getGalleryUrl(item);
                      return (
                        <div
                          key={item.id}
                          draggable={!isView}
                          onDragStart={() => setDragIndex(index)}
                          onDragOver={(event) => {
                            event.preventDefault();
                            setOverIndex(index);
                          }}
                          onDrop={() => handleDrop(index)}
                          onDragEnd={() => {
                            setDragIndex(null);
                            setOverIndex(null);
                          }}
                          className={`relative shrink-0 rounded-lg border-2 bg-white p-1 transition ${
                            index === activeGalleryIndex ? "border-earth-brown ring-2 ring-earth-brown/20" : "border-line"
                          } ${overIndex === index ? "scale-105" : ""} ${isView ? "" : "cursor-grab"}`}
                        >
                          <button type="button" onClick={() => setActiveGalleryIndex(index)}>
                            <img src={url} alt={`Foto ${index + 1}`} className="h-20 w-20 rounded-md object-contain" />
                          </button>
                          {index === 0 && (
                            <span className="absolute left-1 top-1 rounded bg-earth-brown px-1.5 py-0.5 text-[10px] font-bold text-cream">
                              Portada
                            </span>
                          )}
                          {!isView && (
                            <button
                              type="button"
                              onClick={() => removeGalleryItem(index)}
                              className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white shadow hover:bg-red-700"
                              aria-label={`Eliminar foto ${index + 1}`}
                            >
                              x
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
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
