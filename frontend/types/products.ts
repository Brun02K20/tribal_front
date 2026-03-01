export type ProductFoto = {
  id: number;
  url: string;
  id_producto: number;
};

export type Product = {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number | string;
  stock: number | string;
  ancho: number | string;
  alto: number | string;
  profundo: number | string;
  peso_gramos: number | string;
  es_activo: boolean;
  categoria: {
    id: number;
    nombre: string;
  };
  subcategoria: {
    id: number;
    nombre: string;
  };
  fotos: ProductFoto[];
};

export type ProductFormValues = {
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
  id_categoria: number;
  id_subcategoria: number;
  ancho: number;
  alto: number;
  profundo: number;
  peso_gramos: number;
};

export type ProductCreateUpdatePayload = ProductFormValues;

export type ProductDeleteResponse = {
  id: number;
  message: string;
};
