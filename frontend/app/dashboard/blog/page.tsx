"use client";

import AdminShell from "@/features/admin/components/AdminShell";
import AdminOnly from "@/features/admin/components/AdminOnly";
import AdminTable from "@/features/admin/components/AdminTable";
import ConfirmDeleteModal from "@/features/admin/components/ConfirmDeleteModal";
import { useBlogsAdmin } from "@/features/admin/hooks/useBlogsAdmin";
import ErrorState from "@/shared/ui/ErrorState";

export default function AdminBlogPage() {
    const {
        blogs, loading, error, submitting,
        selected, isDeleteModalOpen,
        openCreate, openEdit, openDelete, closeDelete,
        confirmDelete, toggleBlog,
    } = useBlogsAdmin();

    return (
        <AdminOnly>
            <AdminShell title="Gestión de Blog" subtitle="Creá, editá y eliminá artículos.">
                {error && <ErrorState message={error} className="mb-4" />}

                <div className="mb-4">
                    <button className="app-btn-primary" onClick={openCreate}>
                        Nuevo artículo
                    </button>
                </div>

                <AdminTable
                    headers={["ID", "Título", "Fecha", "Activo", "Acciones"]}
                    loading={loading}
                    isEmpty={blogs.length === 0}
                    loadingText="Cargando artículos..."
                    emptyText="No hay artículos."
                >
                    {blogs.map((blog) => (
                        <tr key={blog.id} className="border-t border-line">
                            <td className="p-3 text-sm">{blog.id}</td>
                            <td className="p-3 text-sm font-medium">{blog.titulo}</td>
                            <td className="p-3 text-sm text-zinc-500">
                                {new Date(blog.created_at).toLocaleDateString("es-AR")}
                            </td>
                            <td className="p-3 text-sm">
                                <button
                                    onClick={() => toggleBlog(blog.id)}
                                    className={`rounded px-2 py-1 text-xs font-medium ${
                                        blog.es_activo ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                                    }`}
                                >
                                    {blog.es_activo ? "Activo" : "Inactivo"}
                                </button>
                            </td>
                            <td className="flex gap-2 p-3">
                                <button className="app-btn-secondary text-xs" onClick={() => openEdit(blog)}>
                                    Editar
                                </button>
                                <button className="app-btn-secondary text-xs text-red-600" onClick={() => openDelete(blog)}>
                                    Eliminar
                                </button>
                            </td>
                        </tr>
                    ))}
                </AdminTable>

                {isDeleteModalOpen && selected && (
                    <ConfirmDeleteModal
                        isOpen={isDeleteModalOpen}
                        entityLabel="artículo"
                        entityName={selected.titulo}
                        onCancel={closeDelete}
                        onConfirm={confirmDelete}
                        loading={submitting}
                    />
                )}
            </AdminShell>
        </AdminOnly>
    );
}