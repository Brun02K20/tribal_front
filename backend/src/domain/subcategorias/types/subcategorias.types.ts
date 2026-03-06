export type SubcategoriaResponse = {
  id: number;
  nombre: string;
    id_categoria: number;
    esActivo: boolean;
};

export type SubcategoriaListResponse = SubcategoriaResponse[];