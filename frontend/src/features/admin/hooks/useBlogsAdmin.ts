"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { blogsService } from "@/entities/blogs/api/blogs.service";
import { useToast } from "@/shared/providers/ToastContext";
import type { BlogListItem } from "@/types/blogs";

export function useBlogsAdmin() {
    const { showToast } = useToast();
    const router = useRouter();
    const [blogs, setBlogs] = useState<BlogListItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selected, setSelected] = useState<BlogListItem | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const fetchBlogs = useCallback(async () => {
        setLoading(true);
        try {
            const data = await blogsService.getAllForAdmin();
            setBlogs(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error cargando artículos");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { void fetchBlogs(); }, [fetchBlogs]);

    const openCreate = () => router.push("/dashboard/blog/crear");
    const openEdit = (blog: BlogListItem) => router.push(`/dashboard/blog/${blog.id}/editar`);

    const openDelete = (blog: BlogListItem) => {
        setSelected(blog);
        setIsDeleteModalOpen(true);
    };

    const closeDelete = () => setIsDeleteModalOpen(false);

    const confirmDelete = async () => {
        if (!selected) return;
        setSubmitting(true);
        try {
            await blogsService.delete(selected.id);
            showToast("Artículo eliminado", "success");
            await fetchBlogs();
            closeDelete();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error eliminando");
        } finally {
            setSubmitting(false);
        }
    };

    const toggleBlog = async (id: number) => {
        try {
            await blogsService.toggle(id);
            await fetchBlogs();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error cambiando estado");
        }
    };

    return {
        blogs, loading, error, submitting,
        selected, isDeleteModalOpen,
        openCreate, openEdit, openDelete, closeDelete,
        confirmDelete, toggleBlog,
    };
}