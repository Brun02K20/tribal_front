export type Subcategoria = {
  id: number;
  nombre: string;
  id_categoria: number;
  esActivo: boolean;
};

export type SubcategoriaFormValues = {
  nombre: string;
  id_categoria: number;
};

export type SubcategoriaCreatePayload = {
  nombre: string;
  id_categoria: number;
};

export type SubcategoriaUpdatePayload = {
  nombre: string;
  id_categoria: number;
};

export type SuccessDeleteSubcategoriaResponse = {
  id: number;
  message: string;
};
