export type DescuentoTipo = 'producto' | 'subcategoria' | 'categoria';
export type DescuentoEstado = 'no_empezado' | 'vigente' | 'terminado';

export type EntidadSimple = {
  id: number;
  nombre: string;
};

export type DescuentoResponse = {
  id: number;
  porcentaje: number;
  id_producto: number | null;
  id_subcategoria: number | null;
  id_categoria: number | null;
  fecha_inicio: string;
  fecha_fin: string;
  tipo: DescuentoTipo;
  estado: DescuentoEstado;
  producto: EntidadSimple | null;
  subcategoria: EntidadSimple | null;
  categoria: EntidadSimple | null;
};

export type DescuentoFilters = {
  tipo?: DescuentoTipo;
  estado?: DescuentoEstado;
};

export type DescuentoAplicado = {
  id_descuento: number;
  porcentaje: number;
  tipo: DescuentoTipo;
};
