import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Op } from 'sequelize';
import { Descuentos } from './models/Descuentos';
import { Productos } from 'src/domain/productos/models/Productos';
import { Subcategorias } from 'src/domain/subcategorias/models/Subcategorias';
import { Categorias } from 'src/domain/categorias/models/Categorias';
import type {
  DescuentoAplicado,
  DescuentoEstado,
  DescuentoFilters,
  DescuentoResponse,
  DescuentoTipo,
} from './types/descuentos.types';
import {
  CreateDescuentoDto,
  SuccessDeleteDescuentoDto,
  UpdateDescuentoDto,
} from './DTOs/descuentos.dto';

const DESCUENTO_INCLUDE = [
  {
    model: Productos,
    as: 'producto',
    attributes: ['id', 'nombre'],
  },
  {
    model: Subcategorias,
    as: 'subcategoria',
    attributes: ['id', 'nombre'],
  },
  {
    model: Categorias,
    as: 'categoria',
    attributes: ['id', 'nombre'],
  },
];

type ScopeInfo = {
  tipo: DescuentoTipo;
  targetId: number;
};

@Injectable()
export class DescuentosService {
  private parseDate(value: string, fieldName: string): Date {
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      throw new BadRequestException(`${fieldName} inválida`);
    }

    return parsed;
  }

  private parseAndValidateDates(fechaInicio: string, fechaFin: string): { inicio: Date; fin: Date } {
    const inicio = this.parseDate(fechaInicio, 'fecha_inicio');
    const fin = this.parseDate(fechaFin, 'fecha_fin');

    if (inicio >= fin) {
      throw new BadRequestException('fecha_inicio debe ser menor a fecha_fin');
    }

    return { inicio, fin };
  }

  private resolveScope(payload: {
    id_producto?: number | null;
    id_subcategoria?: number | null;
    id_categoria?: number | null;
  }): ScopeInfo {
    const entries: Array<{ tipo: DescuentoTipo; value: number | undefined | null }> = [
      { tipo: 'producto', value: payload.id_producto },
      { tipo: 'subcategoria', value: payload.id_subcategoria },
      { tipo: 'categoria', value: payload.id_categoria },
    ];

    const configured = entries.filter((entry) => typeof entry.value === 'number' && Number(entry.value) > 0);

    if (configured.length !== 1) {
      throw new BadRequestException('Debe enviar exactamente uno entre id_producto, id_subcategoria o id_categoria');
    }

    return {
      tipo: configured[0].tipo,
      targetId: Number(configured[0].value),
    };
  }

  private getTipoFromDescuento(descuento: Descuentos): DescuentoTipo {
    if (descuento.id_producto) {
      return 'producto';
    }

    if (descuento.id_subcategoria) {
      return 'subcategoria';
    }

    return 'categoria';
  }

  private getEstadoDescuento(descuento: Descuentos, now = new Date()): DescuentoEstado {
    const inicio = new Date(descuento.fecha_inicio);
    const fin = new Date(descuento.fecha_fin);

    if (inicio > now) {
      return 'no_empezado';
    }

    if (fin < now) {
      return 'terminado';
    }

    return 'vigente';
  }

  private mapDescuento(descuento: Descuentos): DescuentoResponse {
    return {
      id: descuento.id,
      porcentaje: Number(descuento.porcentaje),
      id_producto: descuento.id_producto,
      id_subcategoria: descuento.id_subcategoria,
      id_categoria: descuento.id_categoria,
      fecha_inicio: new Date(descuento.fecha_inicio).toISOString(),
      fecha_fin: new Date(descuento.fecha_fin).toISOString(),
      tipo: this.getTipoFromDescuento(descuento),
      estado: this.getEstadoDescuento(descuento),
      producto: descuento.producto ? { id: descuento.producto.id, nombre: descuento.producto.nombre } : null,
      subcategoria: descuento.subcategoria
        ? { id: descuento.subcategoria.id, nombre: descuento.subcategoria.nombre }
        : null,
      categoria: descuento.categoria ? { id: descuento.categoria.id, nombre: descuento.categoria.nombre } : null,
    };
  }

  private async ensureTargetExists(scope: ScopeInfo): Promise<void> {
    if (scope.tipo === 'producto') {
      const producto = await Productos.findByPk(scope.targetId);
      if (!producto) {
        throw new NotFoundException(`Producto with id ${scope.targetId} not found`);
      }
      return;
    }

    if (scope.tipo === 'subcategoria') {
      const subcategoria = await Subcategorias.findByPk(scope.targetId);
      if (!subcategoria) {
        throw new NotFoundException(`Subcategoria with id ${scope.targetId} not found`);
      }
      return;
    }

    const categoria = await Categorias.findByPk(scope.targetId);
    if (!categoria) {
      throw new NotFoundException(`Categoria with id ${scope.targetId} not found`);
    }
  }

  private buildScopeWhere(scope: ScopeInfo): Record<string, unknown> {
    if (scope.tipo === 'producto') {
      return { id_producto: scope.targetId };
    }

    if (scope.tipo === 'subcategoria') {
      return { id_subcategoria: scope.targetId };
    }

    return { id_categoria: scope.targetId };
  }

  private async removeNonFinishedDiscountsForScope(params: {
    scope: ScopeInfo;
    excludeId?: number;
  }): Promise<void> {
    const whereScope = this.buildScopeWhere(params.scope);
    const now = new Date();

    const where: Record<string, unknown> = {
      ...whereScope,
      es_activo: true,
      fecha_fin: { [Op.gte]: now },
    };

    if (params.excludeId) {
      where.id = { [Op.ne]: params.excludeId };
    }

    const nonFinished = await Descuentos.findAll({ where });
    const idsToDelete = nonFinished.map((item) => item.id);

    if (idsToDelete.length > 0) {
      await Descuentos.destroy({ where: { id: { [Op.in]: idsToDelete } } });
    }
  }

  private buildFiltersWhere(filters: DescuentoFilters): Record<string, unknown> {
    const where: Record<string, unknown> = {};
    const now = new Date();

    where.es_activo = true;

    if (filters.tipo === 'producto') {
      where.id_producto = { [Op.ne]: null };
    }

    if (filters.tipo === 'subcategoria') {
      where.id_subcategoria = { [Op.ne]: null };
    }

    if (filters.tipo === 'categoria') {
      where.id_categoria = { [Op.ne]: null };
    }

    if (filters.estado === 'vigente') {
      where.fecha_inicio = { [Op.lte]: now };
      where.fecha_fin = { [Op.gte]: now };
    }

    if (filters.estado === 'terminado') {
      where.fecha_fin = { [Op.lt]: now };
    }

    if (filters.estado === 'no_empezado') {
      where.fecha_inicio = { [Op.gt]: now };
    }

    return where;
  }

  private async findOneOrThrow(id: number): Promise<Descuentos> {
    const descuento = await Descuentos.findOne({
      where: { id, es_activo: true },
      include: DESCUENTO_INCLUDE,
    });
    if (!descuento) {
      throw new NotFoundException(`Descuento with id ${id} not found`);
    }

    return descuento;
  }

  async findAll(filters: DescuentoFilters): Promise<DescuentoResponse[]> {
    const descuentos = await Descuentos.findAll({
      where: this.buildFiltersWhere(filters),
      include: DESCUENTO_INCLUDE,
      order: [
        ['fecha_inicio', 'DESC'],
        ['id', 'DESC'],
      ],
    });

    return descuentos.map((descuento) => this.mapDescuento(descuento));
  }

  async findById(id: number): Promise<DescuentoResponse> {
    const descuento = await this.findOneOrThrow(id);
    return this.mapDescuento(descuento);
  }

  async create(body: CreateDescuentoDto): Promise<DescuentoResponse> {
    const { inicio, fin } = this.parseAndValidateDates(body.fecha_inicio, body.fecha_fin);
    const scope = this.resolveScope(body);

    await this.ensureTargetExists(scope);
    await this.removeNonFinishedDiscountsForScope({
      scope,
    });

    const descuento = await Descuentos.create({
      porcentaje: Number(body.porcentaje),
      id_producto: scope.tipo === 'producto' ? scope.targetId : null,
      id_subcategoria: scope.tipo === 'subcategoria' ? scope.targetId : null,
      id_categoria: scope.tipo === 'categoria' ? scope.targetId : null,
      fecha_inicio: inicio,
      fecha_fin: fin,
      es_activo: true,
    });

    return this.findById(descuento.id);
  }

  async update(id: number, body: UpdateDescuentoDto): Promise<DescuentoResponse> {
    const descuento = await this.findOneOrThrow(id);
    const { inicio, fin } = this.parseAndValidateDates(body.fecha_inicio, body.fecha_fin);
    const scope = this.resolveScope(body);

    await this.ensureTargetExists(scope);
    await this.removeNonFinishedDiscountsForScope({
      scope,
      excludeId: id,
    });

    await descuento.update({
      porcentaje: Number(body.porcentaje),
      id_producto: scope.tipo === 'producto' ? scope.targetId : null,
      id_subcategoria: scope.tipo === 'subcategoria' ? scope.targetId : null,
      id_categoria: scope.tipo === 'categoria' ? scope.targetId : null,
      fecha_inicio: inicio,
      fecha_fin: fin,
    });

    return this.findById(id);
  }

  async delete(id: number): Promise<SuccessDeleteDescuentoDto> {
    const descuento = await this.findOneOrThrow(id);
    await descuento.update({ es_activo: false });

    return {
      id,
      message: 'Descuento eliminado exitosamente',
    };
  }

  async resolveEffectiveDiscountsForProducts(
    productos: Array<Pick<Productos, 'id' | 'id_categoria' | 'id_subcategoria'>>,
    now = new Date(),
  ): Promise<Map<number, DescuentoAplicado>> {
    const result = new Map<number, DescuentoAplicado>();

    if (productos.length === 0) {
      return result;
    }

    const productIds = [...new Set(productos.map((item) => item.id).filter((id) => Number(id) > 0))];
    const subcategoriaIds = [
      ...new Set(productos.map((item) => item.id_subcategoria).filter((id) => Number(id) > 0)),
    ];
    const categoriaIds = [...new Set(productos.map((item) => item.id_categoria).filter((id) => Number(id) > 0))];

    const orConditions: Record<string, unknown>[] = [];
    if (productIds.length > 0) {
      orConditions.push({ id_producto: { [Op.in]: productIds } });
    }
    if (subcategoriaIds.length > 0) {
      orConditions.push({ id_subcategoria: { [Op.in]: subcategoriaIds } });
    }
    if (categoriaIds.length > 0) {
      orConditions.push({ id_categoria: { [Op.in]: categoriaIds } });
    }

    if (orConditions.length === 0) {
      return result;
    }

    const descuentos = await Descuentos.findAll({
      where: {
        es_activo: true,
        fecha_inicio: { [Op.lte]: now },
        fecha_fin: { [Op.gte]: now },
        [Op.or]: orConditions,
      },
      order: [
        ['porcentaje', 'ASC'],
        ['id', 'ASC'],
      ],
    });

    const byProducto = new Map<number, Descuentos>();
    const bySubcategoria = new Map<number, Descuentos>();
    const byCategoria = new Map<number, Descuentos>();

    for (const descuento of descuentos) {
      const porcentaje = Number(descuento.porcentaje);

      if (descuento.id_producto) {
        const previous = byProducto.get(descuento.id_producto);
        if (!previous || Number(previous.porcentaje) > porcentaje) {
          byProducto.set(descuento.id_producto, descuento);
        }
        continue;
      }

      if (descuento.id_subcategoria) {
        const previous = bySubcategoria.get(descuento.id_subcategoria);
        if (!previous || Number(previous.porcentaje) > porcentaje) {
          bySubcategoria.set(descuento.id_subcategoria, descuento);
        }
        continue;
      }

      if (descuento.id_categoria) {
        const previous = byCategoria.get(descuento.id_categoria);
        if (!previous || Number(previous.porcentaje) > porcentaje) {
          byCategoria.set(descuento.id_categoria, descuento);
        }
      }
    }

    for (const producto of productos) {
      const descuentoProducto = byProducto.get(producto.id);
      if (descuentoProducto) {
        result.set(producto.id, {
          id_descuento: descuentoProducto.id,
          porcentaje: Number(descuentoProducto.porcentaje),
          tipo: 'producto',
        });
        continue;
      }

      const descuentoSubcategoria = bySubcategoria.get(producto.id_subcategoria);
      if (descuentoSubcategoria) {
        result.set(producto.id, {
          id_descuento: descuentoSubcategoria.id,
          porcentaje: Number(descuentoSubcategoria.porcentaje),
          tipo: 'subcategoria',
        });
        continue;
      }

      const descuentoCategoria = byCategoria.get(producto.id_categoria);
      if (descuentoCategoria) {
        result.set(producto.id, {
          id_descuento: descuentoCategoria.id,
          porcentaje: Number(descuentoCategoria.porcentaje),
          tipo: 'categoria',
        });
      }
    }

    return result;
  }
}
