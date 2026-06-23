"use client";

import { use, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import AdminOnly from "@/features/admin/components/AdminOnly";
import AdminShell from "@/features/admin/components/AdminShell";
import { blogsService } from "@/entities/blogs/api/blogs.service";
import { useToast } from "@/shared/providers/ToastContext";
import LoadingState from "@/shared/ui/LoadingState";
import type { BlogPhotoOrderItem } from "@/types/blogs";

const RichTextEditor = dynamic(() => import("@/shared/ui/RichTextEditor"), { ssr: false });

type MediaItem =
    | { type: "existing"; id: number; url: string }
    | { type: "new"; file: File; preview: string };

export default function EditarBlogPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const { showToast } = useToast();
    const [titulo, setTitulo] = useState("");
    const [cuerpo, setCuerpo] = useState("");
    const [items, setItems] = useState<MediaItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [dragIndex, setDragIndex] = useState<number | null>(null);
    const [overIndex, setOverIndex] = useState<number | null>(null);
    const previewsRef = useRef<Map<string, string>>(new Map());

    useEffect(() => {
        blogsService
            .getById(Number(id))
            .then((blog) => {
                setTitulo(blog.titulo);
                setCuerpo(blog.cuerpo);
                setItems(blog.fotos.map((f) => ({ type: "existing", id: f.id, url: f.url })));
            })
            .catch(() => router.replace("/dashboard/blog"))
            .finally(() => setLoading(false));
    }, [id, router]);

    useEffect(() => {
        return () => {
            previewsRef.current.forEach((url) => URL.revokeObjectURL(url));
        };
    }, []);

    const getPreview = (file: File): string => {
        const key = `${file.name}-${file.size}-${file.lastModified}`;
        if (!previewsRef.current.has(key)) {
            previewsRef.current.set(key, URL.createObjectURL(file));
        }
        return previewsRef.current.get(key)!;
    };

    const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = Array.from(e.target.files ?? []);
        if (!selected.length) return;
        setItems((prev) => [
            ...prev,
            ...selected.map((file): MediaItem => ({ type: "new", file, preview: getPreview(file) })),
        ]);
        e.target.value = "";
    };

    const removeItem = (index: number) => {
        setItems((prev) => prev.filter((_, i) => i !== index));
    };

    const moveItem = (from: number, to: number) => {
        if (from === to) return;
        setItems((prev) => {
            const next = [...prev];
            const [item] = next.splice(from, 1);
            next.splice(to, 0, item);
            return next;
        });
    };

    const handleSubmit = async () => {
        if (!titulo.trim() || !cuerpo.trim()) {
            showToast("Completá título y contenido", "error");
            return;
        }
        setSubmitting(true);
        try {
            const newFiles: File[] = [];
            const fileIndexMap = new Map<File, number>();
            items.forEach((item) => {
                if (item.type === "new") {
                    fileIndexMap.set(item.file, newFiles.length);
                    newFiles.push(item.file);
                }
            });

            const fotosOrdenadas: BlogPhotoOrderItem[] = items.map((item) => {
                if (item.type === "existing") return { type: "existing", url: item.url };
                return { type: "new", fileIndex: fileIndexMap.get(item.file)! };
            });

            await blogsService.update(
                Number(id),
                { titulo: titulo.trim(), cuerpo: cuerpo.trim() },
                newFiles.length ? newFiles : undefined,
                fotosOrdenadas,
            );
            showToast("Artículo actualizado", "success");
            router.push("/dashboard/blog");
        } catch {
            showToast("Error actualizando artículo", "error");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <AdminOnly>
                <AdminShell title="Editar artículo">
                    <LoadingState message="Cargando..." />
                </AdminShell>
            </AdminOnly>
        );
    }

    return (
        <AdminOnly>
            <AdminShell title="Editar artículo" subtitle={`Editando: ${titulo}`}>
                <div className="space-y-5 max-w-3xl">
                    <div>
                        <label className="mb-1 block text-sm font-medium">Título</label>
                        <input
                            className="app-input w-full"
                            value={titulo}
                            onChange={(e) => setTitulo(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium">Contenido</label>
                        <RichTextEditor content={cuerpo} onChange={setCuerpo} />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium">
                            Imágenes
                            <span className="ml-1 font-normal text-zinc-500">(arrastrá para reordenar · la primera será la portada)</span>
                        </label>
                        <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleFiles}
                            className="text-sm"
                        />

                        {items.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-3">
                                {items.map((item, index) => {
                                    const src = item.type === "existing" ? item.url : item.preview;
                                    const isDragging = dragIndex === index;
                                    const isOver = overIndex === index;
                                    return (
                                        <div
                                            key={index}
                                            className={[
                                                "relative shrink-0 cursor-grab rounded-lg border-2 transition-all",
                                                isDragging ? "opacity-40 border-amber-500" : "border-transparent",
                                                isOver && !isDragging ? "scale-105 border-amber-400" : "",
                                            ].join(" ")}
                                            draggable
                                            onDragStart={() => setDragIndex(index)}
                                            onDragOver={(e) => { e.preventDefault(); setOverIndex(index); }}
                                            onDrop={() => { if (dragIndex !== null) moveItem(dragIndex, index); setDragIndex(null); setOverIndex(null); }}
                                            onDragEnd={() => { setDragIndex(null); setOverIndex(null); }}
                                        >
                                            <img
                                                src={src}
                                                alt={`Foto ${index + 1}`}
                                                className="h-24 w-24 rounded-lg object-cover"
                                            />
                                            {index === 0 && (
                                                <span className="absolute top-1 left-1 rounded bg-amber-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
                                                    Portada
                                                </span>
                                            )}
                                            {item.type === "new" && (
                                                <span className="absolute bottom-1 left-1 rounded bg-blue-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
                                                    Nueva
                                                </span>
                                            )}
                                            <button
                                                type="button"
                                                onClick={() => removeItem(index)}
                                                className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white text-xs font-bold leading-none hover:bg-red-600"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button className="app-btn-primary" onClick={handleSubmit} disabled={submitting}>
                            {submitting ? "Guardando..." : "Guardar cambios"}
                        </button>
                        <button className="app-btn-secondary" onClick={() => router.push("/dashboard/blog")}>
                            Cancelar
                        </button>
                    </div>
                </div>
            </AdminShell>
        </AdminOnly>
    );
}
