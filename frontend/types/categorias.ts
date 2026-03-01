export type Categoria = {
  id: number;
  nombre: string;
  esActivo: boolean;
};

export type CategoriaWithSubcategorias = Categoria & {
  subcategorias: Array<{
    id: number;
    nombre: string;
    id_categoria: number;
    esActivo: boolean;
  }>;
};

export type CategoriaFormValues = {
  nombre: string;
};

export type CategoriaCreatePayload = {
  nombre: string;
};

export type CategoriaUpdatePayload = {
  nombre: string;
};

export type SuccessDeleteCategoriaResponse = {
  id: number;
  message: string;
};
