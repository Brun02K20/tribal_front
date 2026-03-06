import { Injectable } from '@nestjs/common';
import { QueryTypes } from 'sequelize';
import { sequelize } from 'src/database/database';
import type {
  BarMetricItem,
  ClientOrdersMetricItem,
  MetricasResponse,
  PieMetricItem,
  ProductRatingMetricItem,
  ProductSalesMetricItem,
} from './types/metricas.types';

type MonthlyRow = { month: string; value: number | string | null };
type ProductSalesRow = { id: number | string; nombre: string; unidades_vendidas: number | string | null };
type ProductRatingRow = {
  id: number | string;
  nombre: string;
  promedio_calificacion: number | string | null;
  total_resenas: number | string | null;
};
type PieRow = { label: string; value: number | string | null };
type NumericRow = { value: number | string | null };
type ClientRatioRow = {
  con_pedido: number | string | null;
  sin_pedido: number | string | null;
  total_clientes: number | string | null;
};
type ClientOrdersRow = {
  id: number | string;
  nombre: string;
  email: string | null;
  pedidos: number | string | null;
};

@Injectable()
export class MetricasService {
  private getFechaDesde(months: number): Date {
    const today = new Date();
    const start = new Date(today.getFullYear(), today.getMonth(), 1);
    start.setMonth(start.getMonth() - (months - 1));
    return start;
  }

  private toNumber(value: unknown): number {
    if (value === null || value === undefined) {
      return 0;
    }

    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  private toMonthlyItems(rows: MonthlyRow[]): BarMetricItem[] {
    return rows.map((row) => ({
      label: row.month,
      value: this.toNumber(row.value),
    }));
  }

  private toProductSalesItems(rows: ProductSalesRow[]): ProductSalesMetricItem[] {
    return rows.map((row) => ({
      id: this.toNumber(row.id),
      nombre: row.nombre,
      unidadesVendidas: this.toNumber(row.unidades_vendidas),
    }));
  }

  private toProductRatingItems(rows: ProductRatingRow[]): ProductRatingMetricItem[] {
    return rows.map((row) => ({
      id: this.toNumber(row.id),
      nombre: row.nombre,
      promedioCalificacion: this.toNumber(row.promedio_calificacion),
      totalResenas: this.toNumber(row.total_resenas),
    }));
  }

  private toPieItems(rows: PieRow[]): PieMetricItem[] {
    return rows.map((row) => ({
      label: row.label,
      value: this.toNumber(row.value),
    }));
  }

  private toClientOrdersItems(rows: ClientOrdersRow[]): ClientOrdersMetricItem[] {
    return rows.map((row) => ({
      id: this.toNumber(row.id),
      nombre: row.nombre,
      email: row.email ?? '',
      pedidos: this.toNumber(row.pedidos),
    }));
  }

  async getDashboardMetricas(months = 12): Promise<MetricasResponse> {
    const fechaDesde = this.getFechaDesde(months);

    const [
      topMasVendidosRows,
      topMenosVendidosRows,
      productosVendidosPorMesRows,
      promedioGastadoRows,
      maximaVentaRows,
      minimaVentaRows,
      ventasPorMesCantidadRows,
      ventasPorMesMontoRows,
      pedidosPorEstadoPedidoRows,
      pedidosPorEstadoEnvioRows,
      pedidosPorMesRows,
      clientesConPedidoRows,
      topClientesRows,
      topMejorCalificadosRows,
      topPeorCalificadosRows,
      usuariosRegistradosRows,
    ] = await Promise.all([
      sequelize.query<ProductSalesRow>(
        `SELECT p.id, p.nombre, COALESCE(SUM(dp.unidades), 0) AS unidades_vendidas
         FROM Productos p
         LEFT JOIN DetallePedidos dp
           ON dp.id_producto = p.id
          AND dp.es_activo = 1
         LEFT JOIN Pedidos pe
           ON pe.id = dp.id_pedido
          AND pe.es_activo = 1
          AND pe.fecha_pedido >= :fechaDesde
         GROUP BY p.id, p.nombre
         ORDER BY unidades_vendidas DESC, p.nombre ASC
         LIMIT 10`,
        { type: QueryTypes.SELECT, replacements: { fechaDesde } },
      ),
      sequelize.query<ProductSalesRow>(
        `SELECT p.id, p.nombre, COALESCE(SUM(dp.unidades), 0) AS unidades_vendidas
         FROM Productos p
         LEFT JOIN DetallePedidos dp
           ON dp.id_producto = p.id
          AND dp.es_activo = 1
         LEFT JOIN Pedidos pe
           ON pe.id = dp.id_pedido
          AND pe.es_activo = 1
          AND pe.fecha_pedido >= :fechaDesde
         GROUP BY p.id, p.nombre
         ORDER BY unidades_vendidas ASC, p.nombre ASC
         LIMIT 10`,
        { type: QueryTypes.SELECT, replacements: { fechaDesde } },
      ),
      sequelize.query<MonthlyRow>(
        `SELECT DATE_FORMAT(pe.fecha_pedido, '%Y-%m') AS month,
                COALESCE(SUM(dp.unidades), 0) AS value
         FROM Pedidos pe
         INNER JOIN DetallePedidos dp
           ON dp.id_pedido = pe.id
          AND dp.es_activo = 1
         WHERE pe.es_activo = 1
           AND pe.fecha_pedido >= :fechaDesde
         GROUP BY DATE_FORMAT(pe.fecha_pedido, '%Y-%m')
         ORDER BY month ASC`,
        { type: QueryTypes.SELECT, replacements: { fechaDesde } },
      ),
      sequelize.query<NumericRow>(
        `SELECT COALESCE(AVG(pg.monto_total), 0) AS value
         FROM Pagos pg
         WHERE pg.es_activo = 1
           AND pg.aprobado = 1
           AND pg.fecha_pago >= :fechaDesde`,
        { type: QueryTypes.SELECT, replacements: { fechaDesde } },
      ),
      sequelize.query<NumericRow>(
        `SELECT COALESCE(MAX(pg.monto_total), 0) AS value
         FROM Pagos pg
         WHERE pg.es_activo = 1
           AND pg.aprobado = 1
           AND pg.fecha_pago >= :fechaDesde`,
        { type: QueryTypes.SELECT, replacements: { fechaDesde } },
      ),
      sequelize.query<NumericRow>(
        `SELECT COALESCE(MIN(pg.monto_total), 0) AS value
         FROM Pagos pg
         WHERE pg.es_activo = 1
           AND pg.aprobado = 1
           AND pg.fecha_pago >= :fechaDesde`,
        { type: QueryTypes.SELECT, replacements: { fechaDesde } },
      ),
      sequelize.query<MonthlyRow>(
        `SELECT DATE_FORMAT(pg.fecha_pago, '%Y-%m') AS month,
                COUNT(pg.id) AS value
         FROM Pagos pg
         WHERE pg.es_activo = 1
           AND pg.aprobado = 1
           AND pg.fecha_pago >= :fechaDesde
         GROUP BY DATE_FORMAT(pg.fecha_pago, '%Y-%m')
         ORDER BY month ASC`,
        { type: QueryTypes.SELECT, replacements: { fechaDesde } },
      ),
      sequelize.query<MonthlyRow>(
        `SELECT DATE_FORMAT(pg.fecha_pago, '%Y-%m') AS month,
                COALESCE(SUM(pg.monto_total), 0) AS value
         FROM Pagos pg
         WHERE pg.es_activo = 1
           AND pg.aprobado = 1
           AND pg.fecha_pago >= :fechaDesde
         GROUP BY DATE_FORMAT(pg.fecha_pago, '%Y-%m')
         ORDER BY month ASC`,
        { type: QueryTypes.SELECT, replacements: { fechaDesde } },
      ),
      sequelize.query<PieRow>(
        `SELECT ep.nombre AS label,
                COUNT(pe.id) AS value
         FROM Pedidos pe
         INNER JOIN EstadoPedidos ep ON ep.id = pe.id_estado_pedido
         WHERE pe.es_activo = 1
           AND pe.fecha_pedido >= :fechaDesde
         GROUP BY ep.id, ep.nombre
         ORDER BY value DESC, ep.nombre ASC`,
        { type: QueryTypes.SELECT, replacements: { fechaDesde } },
      ),
      sequelize.query<PieRow>(
        `SELECT ee.nombre AS label,
                COUNT(pe.id) AS value
         FROM Pedidos pe
         INNER JOIN Envios en ON en.id_pedido = pe.id AND en.es_activo = 1
         INNER JOIN EstadoEnvios ee ON ee.id = en.id_estado_envio
         WHERE pe.es_activo = 1
           AND pe.fecha_pedido >= :fechaDesde
         GROUP BY ee.id, ee.nombre
         ORDER BY value DESC, ee.nombre ASC`,
        { type: QueryTypes.SELECT, replacements: { fechaDesde } },
      ),
      sequelize.query<MonthlyRow>(
        `SELECT DATE_FORMAT(pe.fecha_pedido, '%Y-%m') AS month,
                COUNT(pe.id) AS value
         FROM Pedidos pe
         WHERE pe.es_activo = 1
           AND pe.fecha_pedido >= :fechaDesde
         GROUP BY DATE_FORMAT(pe.fecha_pedido, '%Y-%m')
         ORDER BY month ASC`,
        { type: QueryTypes.SELECT, replacements: { fechaDesde } },
      ),
      sequelize.query<ClientRatioRow>(
        `SELECT
            SUM(CASE WHEN clientes.pedidos_count > 0 THEN 1 ELSE 0 END) AS con_pedido,
            SUM(CASE WHEN clientes.pedidos_count = 0 THEN 1 ELSE 0 END) AS sin_pedido,
            COUNT(*) AS total_clientes
         FROM (
           SELECT u.id, COUNT(pe.id) AS pedidos_count
           FROM Usuarios u
           LEFT JOIN Pedidos pe ON pe.id_usuario = u.id AND pe.es_activo = 1 AND pe.fecha_pedido >= :fechaDesde
           WHERE u.id_rol = 2
           GROUP BY u.id
         ) AS clientes`,
        { type: QueryTypes.SELECT, replacements: { fechaDesde } },
      ),
      sequelize.query<ClientOrdersRow>(
        `SELECT u.id,
                u.nombre,
                u.email,
                COUNT(pe.id) AS pedidos
         FROM Usuarios u
         LEFT JOIN Pedidos pe ON pe.id_usuario = u.id AND pe.es_activo = 1 AND pe.fecha_pedido >= :fechaDesde
         WHERE u.id_rol = 2
         GROUP BY u.id, u.nombre, u.email
         ORDER BY pedidos DESC, u.nombre ASC
         LIMIT 10`,
        { type: QueryTypes.SELECT, replacements: { fechaDesde } },
      ),
      sequelize.query<ProductRatingRow>(
        `SELECT p.id,
                p.nombre,
                ROUND(AVG(r.calificacion), 2) AS promedio_calificacion,
                COUNT(r.id) AS total_resenas
         FROM Resenas r
         INNER JOIN Productos p ON p.id = r.id_producto AND p.es_activo = 1
         WHERE r.es_activo = 1
           AND r.fecha >= :fechaDesde
         GROUP BY p.id, p.nombre
         HAVING COUNT(r.id) > 0
         ORDER BY promedio_calificacion DESC, total_resenas DESC, p.nombre ASC
         LIMIT 10`,
        { type: QueryTypes.SELECT, replacements: { fechaDesde } },
      ),
      sequelize.query<ProductRatingRow>(
        `SELECT p.id,
                p.nombre,
                ROUND(AVG(r.calificacion), 2) AS promedio_calificacion,
                COUNT(r.id) AS total_resenas
         FROM Resenas r
         INNER JOIN Productos p ON p.id = r.id_producto AND p.es_activo = 1
         WHERE r.es_activo = 1
           AND r.fecha >= :fechaDesde
         GROUP BY p.id, p.nombre
         HAVING COUNT(r.id) > 0
         ORDER BY promedio_calificacion ASC, total_resenas DESC, p.nombre ASC
         LIMIT 10`,
        { type: QueryTypes.SELECT, replacements: { fechaDesde } },
      ),
      sequelize.query<NumericRow>(
        `SELECT COUNT(u.id) AS value
         FROM Usuarios u
         WHERE u.id_rol = 2
           AND u.fecha_registro >= :fechaDesde`,
        { type: QueryTypes.SELECT, replacements: { fechaDesde } },
      ),
    ]);

    const promedioGastadoTotal = this.toNumber(promedioGastadoRows[0]?.value);
    const maximaVenta = this.toNumber(maximaVentaRows[0]?.value);
    const minimaVenta = this.toNumber(minimaVentaRows[0]?.value);

    const ratioRow = clientesConPedidoRows[0];
    const conPedido = this.toNumber(ratioRow?.con_pedido);
    const sinPedido = this.toNumber(ratioRow?.sin_pedido);
    const totalClientes = this.toNumber(ratioRow?.total_clientes);
    const porcentajeConPedido = totalClientes > 0 ? Number(((conPedido / totalClientes) * 100).toFixed(2)) : 0;
    const porcentajeSinPedido = totalClientes > 0 ? Number(((sinPedido / totalClientes) * 100).toFixed(2)) : 0;

    return {
      productos: {
        topMasVendidos: this.toProductSalesItems(topMasVendidosRows),
        topMenosVendidos: this.toProductSalesItems(topMenosVendidosRows),
        vendidosPorMes: this.toMonthlyItems(productosVendidosPorMesRows),
        topMejorCalificados: this.toProductRatingItems(topMejorCalificadosRows),
        topPeorCalificados: this.toProductRatingItems(topPeorCalificadosRows),
      },
      ventasPagos: {
        promedioGastadoTotal,
        maximaVenta,
        minimaVenta,
        ventasPorMesCantidad: this.toMonthlyItems(ventasPorMesCantidadRows),
        ventasPorMesMonto: this.toMonthlyItems(ventasPorMesMontoRows),
      },
      pedidos: {
        cantidadPorEstadoPedido: this.toPieItems(pedidosPorEstadoPedidoRows),
        cantidadPorEstadoEnvio: this.toPieItems(pedidosPorEstadoEnvioRows),
        pedidosPorMes: this.toMonthlyItems(pedidosPorMesRows),
      },
      clientes: {
        porcentajeConPedido: {
          conPedido,
          sinPedido,
          porcentajeConPedido,
          porcentajeSinPedido,
          totalClientes,
        },
        usuariosRegistradosPeriodo: this.toNumber(usuariosRegistradosRows[0]?.value),
        topConMasPedidos: this.toClientOrdersItems(topClientesRows),
      },
    };
  }
}
