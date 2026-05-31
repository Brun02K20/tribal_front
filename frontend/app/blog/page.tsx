import type { Metadata } from "next";
import BlogPageClient from "./BlogPageClient";

export const metadata: Metadata = {
    title: "Blog | Tribal Trend",
    description: "Artículos, tips y novedades sobre artesanías.",
    alternates: { canonical: "/blog" },
};

export default function BlogPage() {
    return <BlogPageClient />;
}