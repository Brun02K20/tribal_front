import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { QueryTypes } from 'sequelize';
import { Usuarios } from 'src/auth/models/Usuarios';
import { sequelize } from 'src/database/database';
import { Productos } from 'src/domain/productos/models/Productos';
import { Resenas } from './models/Resenas';
import type { ResenaItemResponse, ResenasProductoResponse } from './types/resenas.types';

type DistribucionRow = {
  calificacion: number | string;
  cantidad: number | string;
};

type PromedioRow = {
  promedio: number | string | null;
  total: number | string | null;
};

type CompraRow = {
  value: number | string | null;
};

@Injectable()
export class ResenasService {
  private toNumber(value: unknown): number {
    if (value === null || value === undefined) {
      return 0;
    }

    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  private validateCalificacion(calificacion: number): number {
    if (!Number.isInteger(calificacion) || calificacion < 1 || calificacion > 5) {
      throw new BadRequestException('La calificación debe ser un entero entre 1 y 5');
    }

    return calificacion;
  }

  private async ensureProductoExiste(idProducto: number): Promise<void> {
    const producto = await Productos.findByPk(idProducto);
    if (!producto || !producto.es_activo) {
      throw new NotFoundException('Producto no encontrado');
    }
  }

  private async ensureUsuarioPuedeResenar(idUsuario: number, idProducto: number): Promise<void> {
    const compras = await sequelize.query<CompraRow>(
      `SELECT COUNT(*) AS value
       FROM DetallePedidos dp
       INNER JOIN Pedidos pe
         ON pe.id = dp.id_pedido
        AND pe.es_activo = 1
        AND pe.id_usuario = :idUsuario
       INNER JOIN Pagos pg
         ON pg.id_pedido = pe.id
        AND pg.es_activo = 1
        AND pg.aprobado = 1
       WHERE dp.es_activo = 1
         AND dp.id_producto = :idProducto`,
      {
        type: QueryTypes.SELECT,
        replacements: { idUsuario, idProducto },
      },
    );

    const cantidadCompras = this.toNumber(compras[0]?.value);
    if (cantidadCompras <= 0) {
      throw new BadRequestException('Solo podés reseñar productos que hayas comprado');
    }
  }

  private mapResenaItem(row: Resenas): ResenaItemResponse {
    return {
      id: row.id,
      id_producto: row.id_producto,
      id_usuario: row.id_usuario,
      calificacion: row.calificacion,
      fecha: row.fecha instanceof Date ? row.fecha.toISOString() : new Date(String(row.fecha)).toISOString(),
      es_activo: row.es_activo,
      usuario: {
        id: row.usuario?.id ?? 0,
        nombre: row.usuario?.nombre ?? 'Usuario',
        username: row.usuario?.username ?? '',
      },
    };
  }

  async getByProducto(idProducto: number): Promise<ResenasProductoResponse> {
    await this.ensureProductoExiste(idProducto);

    const [promedioRows, distribucionRows, resenasRows] = await Promise.all([
      sequelize.query<PromedioRow>(
        `SELECT COALESCE(ROUND(AVG(r.calificacion), 2), 0) AS promedio,
                COUNT(r.id) AS total
         FROM Resenas r
         WHERE r.id_producto = :idProducto
           AND r.es_activo = 1`,
        {
          type: QueryTypes.SELECT,
          replacements: { idProducto },
        },
      ),
      sequelize.query<DistribucionRow>(
        `SELECT r.calificacion,
                COUNT(r.id) AS cantidad
         FROM Resenas r
         WHERE r.id_producto = :idProducto
           AND r.es_activo = 1
         GROUP BY r.calificacion
         ORDER BY r.calificacion DESC`,
        {
          type: QueryTypes.SELECT,
          replacements: { idProducto },
        },
      ),
      Resenas.findAll({
        where: {
          id_producto: idProducto,
          es_activo: true,
        },
        include: [
          {
            model: Usuarios,
            as: 'usuario',
            attributes: ['id', 'nombre', 'username'],
          },
        ],
        order: [['fecha', 'DESC']],
      }),
    ]);

    const promedio = this.toNumber(promedioRows[0]?.promedio);
    const totalCalificaciones = this.toNumber(promedioRows[0]?.total);

    const baseDistribucion = [5, 4, 3, 2, 1].map((calificacion) => ({
      calificacion,
      cantidad: 0,
    }));

    for (const row of distribucionRows) {
      const calificacion = this.toNumber(row.calificacion);
      const found = baseDistribucion.find((item) => item.calificacion === calificacion);
      if (found) {
        found.cantidad = this.toNumber(row.cantidad);
      }
    }

    return {
      promedio,
      totalCalificaciones,
      distribucion: baseDistribucion,
      resenas: resenasRows.map((row) => this.mapResenaItem(row)),
    };
  }

  async create(idUsuario: number, idProducto: number, calificacionRaw: number): Promise<ResenasProductoResponse> {
    const calificacion = this.validateCalificacion(calificacionRaw);

    await this.ensureProductoExiste(idProducto);
    await this.ensureUsuarioPuedeResenar(idUsuario, idProducto);

    const reseñaExistente = await Resenas.findOne({
      where: {
        id_producto: idProducto,
        id_usuario: idUsuario,
      },
    });

    if (reseñaExistente) {
      throw new BadRequestException('Ya realizaste una reseña para este producto');
    }

    await Resenas.create({
      id_producto: idProducto,
      id_usuario: idUsuario,
      calificacion,
      fecha: new Date(),
      es_activo: true,
    });

    return this.getByProducto(idProducto);
  }
}
