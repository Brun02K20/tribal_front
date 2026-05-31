export type BlogListItem = {
    id: number;
    titulo: string;
    es_activo: number;
    created_at: string;
    portada_url: string | null;
};

export type BlogDetail = {
    id: number;
    titulo: string;
    cuerpo: string;
    es_activo: number;
    created_at: string;
    fotos: { id: number; url: string }[];
};

export type BlogFormValues = {
    titulo: string;
    cuerpo: string;
};