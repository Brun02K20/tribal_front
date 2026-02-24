import type { SubcategoriaListResponse } from 'src/subcategorias/types/subcategorias.types';

export type CategoriaResponse = {
  id: number;
  nombre: string;
  subcategorias: SubcategoriaListResponse;
  esActivo: boolean;
};

export type CategoriaListResponse = CategoriaResponse[];
