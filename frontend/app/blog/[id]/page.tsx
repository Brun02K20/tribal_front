"use client";

import { use, useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { blogsService } from "@/entities/blogs/api/blogs.service";
import type { BlogDetail } from "@/types/blogs";
import LoadingState from "@/shared/ui/LoadingState";

function ImageCarousel({ images }: { images: { id: number; url: string }[] }) {
    const [current, setCurrent] = useState(0);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const resetTimer = () => {
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
            setCurrent((p) => (p === images.length - 1 ? 0 : p + 1));
        }, 3000);
    };

    useEffect(() => {
        if (images.length <= 1) return;
        resetTimer();
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [images.length]);

    if (images.length === 0) return null;

    const goTo = (index: number) => {
        setCurrent(index);
        resetTimer();
    };

    return (
        <div className="relative">
            <div className="flex h-[500px] items-center justify-center">
                <img
                    src={images[current].url}
                    alt={`Imagen ${current + 1}`}
                    className="max-h-full w-auto max-w-full object-contain transition-all duration-500"
                />
            </div>
            {images.length > 1 && (
                <>
                    <button
                        onClick={() => goTo(current === 0 ? images.length - 1 : current - 1)}
                        className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/40 px-3 py-1 text-lg text-white hover:bg-black/60"
                    >
                        ‹
                    </button>
                    <button
                        onClick={() => goTo(current === images.length - 1 ? 0 : current + 1)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/40 px-3 py-1 text-lg text-white hover:bg-black/60"
                    >
                        ›
                    </button>
                    <div className="mt-3 flex justify-center gap-2">
                        {images.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => goTo(i)}
                                className={`h-2.5 w-2.5 rounded-full transition-colors ${
                                    i === current ? "bg-earth-brown" : "bg-zinc-300"
                                }`}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}

export default function BlogDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [article, setArticle] = useState<BlogDetail | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        blogsService
            .getById(Number(id))
            .then(setArticle)
            .catch(() => router.replace("/blog"))
            .finally(() => setLoading(false));
    }, [id, router]);

    if (loading) {
        return (
            <main className="app-page">
                <LoadingState message="Cargando artículo..." />
            </main>
        );
    }

    if (!article) return null;

    const portada = article.fotos.length > 0 ? article.fotos[0] : null;
    const restFotos = article.fotos.slice(1);

    return (
        <main className="app-page">
            <article className="app-container mx-auto max-w-240">
                <Link href="/blog" className="app-btn-secondary mb-4 inline-block text-sm">
                    ← Volver al blog
                </Link>

                {/* Portada */}
                {portada && (
                    <div className="mb-6 flex justify-center">
                        <img
                            src={portada.url}
                            alt={article.titulo}
                            className="max-h-[500px] w-auto max-w-full object-contain"
                        />
                    </div>
                )}

                {/* Encabezado */}
                <header className="mb-6">
                    <h1 className="app-title text-3xl sm:text-4xl">{article.titulo}</h1>
                    <p className="mt-2 text-sm text-zinc-500">
                        {new Date(article.created_at).toLocaleDateString("es-AR", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                        })}
                    </p>
                </header>

                {/* Cuerpo */}
                <section
                    className="prose prose-stone max-w-none"
                    dangerouslySetInnerHTML={{ __html: article.cuerpo }}
                />

                {/* Galería */}
                {restFotos.length > 0 && (
                    <section className="mt-8">
                        <h3 className="mb-4 text-lg font-semibold">Galería</h3>
                        <ImageCarousel images={restFotos} />
                    </section>
                )}
            </article>
        </main>
    );
}