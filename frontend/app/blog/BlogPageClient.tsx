"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { blogsService } from "@/entities/blogs/api/blogs.service";
import type { BlogListItem } from "@/types/blogs";
import LoadingState from "@/shared/ui/LoadingState";
import EmptyState from "@/shared/ui/EmptyState";
import ImagePlaceholder from "@/shared/ui/ImagePlaceholder";

export default function BlogPageClient() {
    const [articles, setArticles] = useState<BlogListItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        blogsService.getAll()
            .then(setArticles)
            .catch(() => setArticles([]))
            .finally(() => setLoading(false));
    }, []);

    return (
        <main className="app-page">
            <section className="app-container mx-auto max-w-360">
                <header className="app-panel mb-6">
                    <h1 className="app-title text-3xl">Blog</h1>
                    <p className="app-subtitle mt-2">Tips, novedades y artículos sobre el mundo artesanal.</p>
                </header>

                {loading ? (
                    <LoadingState message="Cargando artículos..." />
                ) : articles.length === 0 ? (
                    <EmptyState message="Todavía no hay artículos publicados." />
                ) : (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {articles.map((article) => (
                            <Link
                                key={article.id}
                                href={`/blog/${article.id}`}
                                className="app-panel group overflow-hidden transition-shadow hover:shadow-md"
                            >
                                {article.portada_url ? (
                                    <img
                                        src={article.portada_url}
                                        alt={article.titulo}
                                        className="h-48 w-full object-cover"
                                    />
                                ) : (
                                    <ImagePlaceholder
                                        className="flex h-48 w-full items-center justify-center bg-zinc-100"
                                        textClassName="text-xs text-zinc-500"
                                    />
                                )}
                                <div className="p-4">
                                    <h2 className="text-lg font-semibold group-hover:text-earth-brown">
                                        {article.titulo}
                                    </h2>
                                    <p className="mt-1 text-xs text-zinc-500">
                                        {new Date(article.created_at).toLocaleDateString("es-AR")}
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </section>
        </main>
    );
}