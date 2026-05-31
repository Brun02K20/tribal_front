"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import AdminOnly from "@/features/admin/components/AdminOnly";
import AdminShell from "@/features/admin/components/AdminShell";
import { blogsService } from "@/entities/blogs/api/blogs.service";
import { useToast } from "@/shared/providers/ToastContext";
import DraggableImageList from "@/shared/ui/DraggableImageList";

const RichTextEditor = dynamic(() => import("@/shared/ui/RichTextEditor"), { ssr: false });

export default function CrearBlogPage() {
    const router = useRouter();
    const { showToast } = useToast();
    const [titulo, setTitulo] = useState("");
    const [cuerpo, setCuerpo] = useState("");
    const [files, setFiles] = useState<File[]>([]);
    const [submitting, setSubmitting] = useState(false);

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
            await blogsService.create({ titulo: titulo.trim(), cuerpo: cuerpo.trim() }, files);
            showToast("Artículo creado", "success");
            router.push("/dashboard/blog");
        } catch (err) {
            console.error("Error completo:", err);
            showToast("Error creando artículo", "error");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <AdminOnly>
            <AdminShell title="Nuevo artículo" subtitle="Creá un artículo para el blog.">
                <div className="space-y-5 max-w-3xl">
                    <div>
                        <label className="mb-1 block text-sm font-medium">Título</label>
                        <input
                            className="app-input w-full"
                            value={titulo}
                            onChange={(e) => setTitulo(e.target.value)}
                            placeholder="Título del artículo"
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium">Contenido</label>
                        <RichTextEditor
                            content={cuerpo}
                            onChange={setCuerpo}
                            placeholder="Escribí el contenido del artículo..."
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium">
                            Imágenes
                            <span className="ml-1 font-normal text-zinc-500">(la primera será la portada)</span>
                        </label>
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
                            {submitting ? "Creando..." : "Publicar artículo"}
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