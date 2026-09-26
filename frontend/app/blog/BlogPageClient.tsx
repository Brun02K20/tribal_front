"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { blogsService } from "@/entities/blogs/api/blogs.service";
import type { BlogListItem } from "@/types/blogs";
import ShopCtaBanner from "@/shared/ui/ShopCtaBanner";
import { IconArrowRight } from "@/shared/ui/Icons";

const formatDate = (value: string) =>
    new Date(value).toLocaleDateString("es-AR", { day: "numeric", month: "long", year: "numeric" });

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
        <main className="mx-auto w-full max-w-360 px-4 pt-8 md:px-6 md:pt-12">
            <header className="max-w-2xl">
                <p className="app-kicker">Blog Tribal</p>
                <h1 className="app-display mt-2 text-4xl md:text-5xl">Historias, piedras y tips</h1>
                <p className="mt-3 text-dark-gray">Inspiración para elegir, combinar y cuidar tus piezas artesanales.</p>
            </header>

            {loading ? (
                <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {Array.from({ length: 3 }).map((_, index) => (
                        <div key={index} className="space-y-3">
                            <div className="app-skeleton aspect-4/3 rounded-3xl" />
                            <div className="app-skeleton h-5 w-3/4 rounded-full" />
                        </div>
                    ))}
                </div>
            ) : articles.length === 0 ? (
                <p className="mt-8 rounded-3xl border border-dashed border-earth-brown/40 bg-white/60 p-8 text-center text-dark-gray">
                    Todavía no hay artículos publicados. Mientras tanto, ¡mirá las piezas nuevas!
                </p>
            ) : (
                <div className="mt-8 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
                    {articles.map((article, index) => (
                        <Link key={article.id} href={`/blog/${article.id}`} className="group block">
                            <div className="relative aspect-4/3 overflow-hidden rounded-3xl bg-sand shadow-[0_14px_28px_rgba(47,47,47,0.12)]">
                                {article.portada_url ? (
                                    <img
                                        src={article.portada_url}
                                        alt={article.titulo}
                                        loading={index < 3 ? "eager" : "lazy"}
                                        className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                                    />
                                ) : (
                                    <span className="absolute inset-0 grid place-items-center text-5xl text-earth-brown/40">✦</span>
                                )}
                            </div>
                            <p className="mt-4 text-xs uppercase tracking-[0.14em] text-dark-gray">{formatDate(article.created_at)}</p>
                            <h2 className="font-display mt-1 text-2xl leading-tight text-black transition group-hover:text-earth-brown">{article.titulo}</h2>
                            <span className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-earth-brown">
                                Leer artículo <IconArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                            </span>
                        </Link>
                    ))}
                </div>
            )}

            <ShopCtaBanner className="mt-16" />
        </main>
    );
}
