export type Diseno = {
  id: number;
  nombre: string;
  precio: number | string;
  stock: number | string;
  url_foto: string | null;
  id_producto: number;
};

export type DisenoFormValues = {
  nombre: string;
  precio: number;
  stock: number;
};
