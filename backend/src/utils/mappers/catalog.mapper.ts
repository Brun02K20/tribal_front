import { Categorias } from 'src/categorias/models/Categorias';
import { Subcategorias } from 'src/subcategorias/models/Subcategorias';

export const mapSubcategoria = (subcategoria: Subcategorias) => ({
  id: subcategoria.id,
  nombre: subcategoria.nombre,
  id_categoria: subcategoria.id_categoria,
  esActivo: subcategoria.esActivo,
});

export const mapCategoriaConSubcategorias = (categoria: Categorias) => ({
  id: categoria.id,
  nombre: categoria.nombre,
  esActivo: categoria.esActivo,
  subcategorias: ((categoria as unknown as { subcategorias?: Subcategorias[] }).subcategorias ?? []).map(
    mapSubcategoria,
  ),
});
