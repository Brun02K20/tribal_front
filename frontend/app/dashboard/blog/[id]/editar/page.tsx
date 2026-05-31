"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import AdminOnly from "@/features/admin/components/AdminOnly";
import AdminShell from "@/features/admin/components/AdminShell";
import { blogsService } from "@/entities/blogs/api/blogs.service";
import { useToast } from "@/shared/providers/ToastContext";
import LoadingState from "@/shared/ui/LoadingState";
import DraggableImageList from "@/shared/ui/DraggableImageList";

const RichTextEditor = dynamic(() => import("@/shared/ui/RichTextEditor"), { ssr: false });

export default function EditarBlogPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const { showToast } = useToast();
    const [titulo, setTitulo] = useState("");
    const [cuerpo, setCuerpo] = useState("");
    const [existingFotos, setExistingFotos] = useState<{ id: number; url: string }[]>([]);
    const [files, setFiles] = useState<File[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        blogsService
            .getById(Number(id))
            .then((blog) => {
                setTitulo(blog.titulo);
                setCuerpo(blog.cuerpo);
                setExistingFotos(blog.fotos);
            })
            .catch(() => router.replace("/dashboard/blog"))
            .finally(() => setLoading(false));
    }, [id, router]);

    const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = Array.from(e.target.files ?? []);
        setFiles((prev) => [...prev, ...selected]);
    };

    const handleSubmit = async () => {
        if (!titulo.trim() || !cuerpo.trim()) {
            showToast("Completá título y contenido", "error");
            return;
        }
        setSubmitting(true);
        try {
            await blogsService.update(
                Number(id),
                { titulo: titulo.trim(), cuerpo: cuerpo.trim() },
                files.length ? files : undefined,
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

                    {/* Fotos existentes */}
                    {existingFotos.length > 0 && (
                        <div>
                            <label className="mb-1 block text-sm font-medium">Imágenes actuales</label>
                            <div className="flex gap-3 overflow-x-auto">
                                {existingFotos.map((foto, i) => (
                                    <div key={foto.id} className="relative shrink-0">
                                        <img
                                            src={foto.url}
                                            alt={`Foto ${i + 1}`}
                                            className="h-24 w-24 rounded-lg object-cover border border-line"
                                        />
                                        {i === 0 && (
                                            <span className="absolute top-1 left-1 rounded bg-amber-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
                                                Portada
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Nuevas fotos */}
                    <div>
                        <label className="mb-1 block text-sm font-medium">Agregar imágenes</label>
                        <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleFiles}
                            className="text-sm"
                        />
                        <DraggableImageList files={files} onChange={setFiles} />
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