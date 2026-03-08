export type DescuentoTipo = "producto" | "subcategoria" | "categoria";
export type DescuentoEstado = "no_empezado" | "vigente" | "terminado";

export type ReferenciaSimple = {
  id: number;
  nombre: string;
};

export type Descuento = {
  id: number;
  porcentaje: number | string;
  id_producto: number | null;
  id_subcategoria: number | null;
  id_categoria: number | null;
  fecha_inicio: string;
  fecha_fin: string;
  tipo: DescuentoTipo;
  estado: DescuentoEstado;
  producto: ReferenciaSimple | null;
  subcategoria: ReferenciaSimple | null;
  categoria: ReferenciaSimple | null;
};

export type CreateUpdateDescuentoPayload = {
  porcentaje: number;
  id_producto?: number;
  id_subcategoria?: number;
  id_categoria?: number;
  fecha_inicio: string;
  fecha_fin: string;
};

export type DescuentoFilters = {
  tipo?: DescuentoTipo;
  estado?: DescuentoEstado;
};

export type SuccessDeleteDescuentoResponse = {
  id: number;
  message: string;
};

export type DescuentoFormValues = {
  porcentaje: number;
  tipo: "" | DescuentoTipo;
  id_referencia: number;
  fecha_inicio: string;
  fecha_fin: string;
};
