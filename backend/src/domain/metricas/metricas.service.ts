import { Injectable } from '@nestjs/common';
import { QueryTypes } from 'sequelize';
import { sequelize } from 'src/database/database';
import type {
  BarMetricItem,
  AuditRecentEventItem,
  ClientOrdersMetricItem,
  DesignPurchaseMetricItem,
  MetricasResponse,
  RegisteredUserMetricItem,
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
type DisenosStatsRow = { total: number | string | null; valor_total: number | string | null };
type AuditRecentEventRow = {
  id: number | string;
  user_id: number | string | null;
  user_label: string | null;
  event_type: string;
  entity_type: string | null;
  entity_id: number | string | null;
  entity_label: string | null;
  ip: string | null;
  created_at: string | Date;
};
type RegisteredUserRow = {
  id: number | string;
  nombre: string;
  telefono: string | null;
  fecha_registro: string | Date;
};
type DesignUrlRow = { disenos_urls: string[] | string | null };
type DesignRow = {
  id: number | string;
  nombre: string;
  url_foto: string | null;
  producto: string | null;
};

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
  private readonly eventLabels: Record<string, string> = {
    USER_REGISTERED: 'Usuarios registrados',
    USER_LOGIN: 'Inicios de sesion',
    PAGE_VISITED: 'Visitas a pagina',
    PRODUCT_VIEWED: 'Productos visitados',
    PRODUCT_SEARCHED: 'Busquedas de productos',
    CHECKOUT_STARTED: 'Checkouts iniciados',
    PAYMENT_STARTED: 'Pagos iniciados',
    PAYMENT_APPROVED: 'Pagos aprobados',
    ADDRESS_CREATED: 'Direcciones creadas',
    ACCOUNT_UPDATED: 'Cuentas actualizadas',
  };

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

  private toTranslatedPieItems(rows: PieRow[]): PieMetricItem[] {
    return rows.map((row) => ({
      label: this.translateEvent(row.label),
      value: this.toNumber(row.value),
    }));
  }

  private toAuditRecentEventItems(rows: AuditRecentEventRow[]): AuditRecentEventItem[] {
    return rows.map((row) => ({
      id: this.toNumber(row.id),
      userId: row.user_id === null ? null : this.toNumber(row.user_id),
      userLabel: row.user_label,
      eventType: row.event_type,
      eventLabel: this.translateEvent(row.event_type),
      entityType: row.entity_type,
      entityId: row.entity_id === null ? null : this.toNumber(row.entity_id),
      entityLabel: row.entity_label,
      ip: row.ip,
      createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : new Date(row.created_at).toISOString(),
    }));
  }

  private toRegisteredUsers(rows: RegisteredUserRow[]): RegisteredUserMetricItem[] {
    return rows.map((row) => ({
      id: this.toNumber(row.id),
      nombre: row.nombre,
      telefono: row.telefono ?? '',
      fechaRegistro: row.fecha_registro instanceof Date
        ? row.fecha_registro.toISOString()
        : new Date(row.fecha_registro).toISOString(),
    }));
  }

  private translateEvent(eventType: string): string {
    return this.eventLabels[eventType] ?? eventType;
  }

  private parseDesignUrls(value: string[] | string | null): string[] {
    if (!value) {
      return [];
    }

    if (Array.isArray(value)) {
      return value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0);
    }

    try {
      const parsed = JSON.parse(value) as unknown;
      if (Array.isArray(parsed)) {
        return parsed.filter((item): item is string => typeof item === 'string' && item.trim().length > 0);
      }
    } catch {
      return [];
    }

    return [];
  }

  private async getDisenosMasComprados(fechaDesde: Date): Promise<DesignPurchaseMetricItem[]> {
    const [detalleRows, designRows] = await Promise.all([
      sequelize.query<DesignUrlRow>(
        `SELECT dp.disenos_urls
         FROM DetallePedidos dp
         INNER JOIN Pedidos pe ON pe.id = dp.id_pedido AND pe.es_activo = 1
         WHERE dp.es_activo = 1
           AND dp.disenos_urls IS NOT NULL
           AND pe.fecha_pedido >= :fechaDesde`,
        { type: QueryTypes.SELECT, replacements: { fechaDesde } },
      ),
      sequelize.query<DesignRow>(
        `SELECT d.id, d.nombre, d.url_foto, p.nombre AS producto
         FROM Disenos d
         LEFT JOIN Productos p ON p.id = d.id_producto
         WHERE d.url_foto IS NOT NULL`,
        { type: QueryTypes.SELECT },
      ),
    ]);

    const countsByUrl = new Map<string, number>();
    for (const row of detalleRows) {
      for (const url of this.parseDesignUrls(row.disenos_urls)) {
        countsByUrl.set(url, (countsByUrl.get(url) ?? 0) + 1);
      }
    }

    return designRows
      .map((row) => ({
        id: this.toNumber(row.id),
        nombre: row.nombre,
        producto: row.producto ?? '',
        urlFoto: row.url_foto ?? '',
        value: countsByUrl.get(row.url_foto ?? '') ?? 0,
      }))
      .filter((item) => item.value > 0)
      .sort((a, b) => b.value - a.value || a.nombre.localeCompare(b.nombre))
      .slice(0, 20);
  }

  async getDashboardMetricas(
    months = 12,
    pagination: {
      userPage?: number;
      userPageSize?: number;
      auditPage?: number;
      auditPageSize?: number;
      auditEventType?: string;
      auditDateFrom?: string;
      auditDateTo?: string;
      auditUserId?: number;
      auditEntityType?: string;
      auditEntityId?: number;
    } = {},
  ): Promise<MetricasResponse> {
    const fechaDesde = this.getFechaDesde(months);
    const userPage = Math.max(1, Math.trunc(pagination.userPage ?? 1));
    const userPageSize = Math.max(1, Math.trunc(pagination.userPageSize ?? 10));
    const userOffset = (userPage - 1) * userPageSize;
    const auditPage = Math.max(1, Math.trunc(pagination.auditPage ?? 1));
    const auditPageSize = Math.max(1, Math.trunc(pagination.auditPageSize ?? 20));
    const auditOffset = (auditPage - 1) * auditPageSize;
    const auditWhereParts = ['al.created_at >= :fechaDesde'];
    const auditReplacements: Record<string, unknown> = { fechaDesde, auditLimit: auditPageSize, auditOffset };

    if (pagination.auditEventType) {
      auditWhereParts.push('al.event_type = :auditEventType');
      auditReplacements.auditEventType = pagination.auditEventType;
    }
    if (pagination.auditDateFrom) {
      auditWhereParts.push('al.created_at >= :auditDateFrom');
      auditReplacements.auditDateFrom = new Date(pagination.auditDateFrom);
    }
    if (pagination.auditDateTo) {
      auditWhereParts.push('al.created_at < DATE_ADD(:auditDateTo, INTERVAL 1 DAY)');
      auditReplacements.auditDateTo = new Date(pagination.auditDateTo);
    }
    if (pagination.auditUserId) {
      auditWhereParts.push('al.user_id = :auditUserId');
      auditReplacements.auditUserId = pagination.auditUserId;
    }
    if (pagination.auditEntityType) {
      auditWhereParts.push('al.entity_type = :auditEntityType');
      auditReplacements.auditEntityType = pagination.auditEntityType;
    }
    if (pagination.auditEntityId) {
      auditWhereParts.push('al.entity_id = :auditEntityId');
      auditReplacements.auditEntityId = pagination.auditEntityId;
    }

    const auditWhereSql = auditWhereParts.join(' AND ');

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
      disenosStatsRows,
      auditTotalRows,
      auditEventosPorTipoRows,
      auditEventosPorMesRows,
      auditProductosMasVistosRows,
      auditBusquedasFrecuentesRows,
      auditIntervalosPrecioRows,
      auditEventosTotalRows,
      auditEventosRows,
      usuariosRegistradosTotalRows,
      usuariosRegistradosPaginaRows,
      disenosMasComprados,
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
      sequelize.query<DisenosStatsRow>(
        `SELECT COUNT(*) AS total, COALESCE(SUM(precio), 0) AS valor_total FROM Disenos`,
        { type: QueryTypes.SELECT },
      ),
      sequelize.query<NumericRow>(
        `SELECT COUNT(*) AS value
         FROM AuditLogs al
         WHERE al.created_at >= :fechaDesde`,
        { type: QueryTypes.SELECT, replacements: { fechaDesde } },
      ),
      sequelize.query<PieRow>(
        `SELECT al.event_type AS label,
                COUNT(al.id) AS value
         FROM AuditLogs al
         WHERE al.created_at >= :fechaDesde
         GROUP BY al.event_type
         ORDER BY value DESC, al.event_type ASC`,
        { type: QueryTypes.SELECT, replacements: { fechaDesde } },
      ),
      sequelize.query<MonthlyRow>(
        `SELECT DATE_FORMAT(al.created_at, '%Y-%m') AS month,
                COUNT(al.id) AS value
         FROM AuditLogs al
         WHERE al.created_at >= :fechaDesde
         GROUP BY DATE_FORMAT(al.created_at, '%Y-%m')
         ORDER BY month ASC`,
        { type: QueryTypes.SELECT, replacements: { fechaDesde } },
      ),
      sequelize.query<PieRow>(
        `SELECT COALESCE(p.nombre, CONCAT('Producto #', al.entity_id)) AS label,
                COUNT(al.id) AS value
         FROM AuditLogs al
         LEFT JOIN Productos p ON p.id = al.entity_id
         WHERE al.event_type = 'PRODUCT_VIEWED'
           AND al.created_at >= :fechaDesde
         GROUP BY al.entity_id, p.nombre
         ORDER BY value DESC, label ASC
         LIMIT 20`,
        { type: QueryTypes.SELECT, replacements: { fechaDesde } },
      ),
      sequelize.query<PieRow>(
        `SELECT COALESCE(NULLIF(JSON_UNQUOTE(JSON_EXTRACT(al.metadata, '$.nombre')), ''), 'Sin texto') AS label,
                COUNT(al.id) AS value
         FROM AuditLogs al
         WHERE al.event_type = 'PRODUCT_SEARCHED'
           AND al.created_at >= :fechaDesde
           AND NULLIF(JSON_UNQUOTE(JSON_EXTRACT(al.metadata, '$.nombre')), '') IS NOT NULL
         GROUP BY label
         ORDER BY value DESC, label ASC
         LIMIT 20`,
        { type: QueryTypes.SELECT, replacements: { fechaDesde } },
      ),
      sequelize.query<PieRow>(
        `SELECT CONCAT(
                  'Min: ',
                  COALESCE(NULLIF(JSON_UNQUOTE(JSON_EXTRACT(al.metadata, '$.precio_min')), ''), 'Sin min'),
                  ' / Max: ',
                  COALESCE(NULLIF(JSON_UNQUOTE(JSON_EXTRACT(al.metadata, '$.precio_max')), ''), 'Sin max')
                ) AS label,
                COUNT(al.id) AS value
         FROM AuditLogs al
         WHERE al.event_type = 'PRODUCT_SEARCHED'
           AND al.created_at >= :fechaDesde
           AND (
             NULLIF(JSON_UNQUOTE(JSON_EXTRACT(al.metadata, '$.precio_min')), '') IS NOT NULL
             OR NULLIF(JSON_UNQUOTE(JSON_EXTRACT(al.metadata, '$.precio_max')), '') IS NOT NULL
           )
         GROUP BY label
         ORDER BY value DESC, label ASC
         LIMIT 20`,
        { type: QueryTypes.SELECT, replacements: { fechaDesde } },
      ),
      sequelize.query<NumericRow>(
        `SELECT COUNT(al.id) AS value
         FROM AuditLogs al
         WHERE ${auditWhereSql}`,
        { type: QueryTypes.SELECT, replacements: auditReplacements },
      ),
      sequelize.query<AuditRecentEventRow>(
        `SELECT al.id,
                al.user_id,
                u.nombre AS user_label,
                al.event_type,
                al.entity_type,
                al.entity_id,
                CASE
                  WHEN al.entity_type = 'USER' THEN eu.nombre
                  WHEN al.entity_type = 'PRODUCT' THEN p.nombre
                  WHEN al.entity_type = 'PEDIDO' THEN CONCAT('Pedido #', al.entity_id)
                  WHEN al.entity_type = 'ENCARGO' THEN CONCAT('Encargo #', al.entity_id)
                  WHEN al.entity_type = 'ADDRESS' THEN CONCAT('Direccion #', al.entity_id)
                  WHEN al.entity_type = 'CHECKOUT' THEN 'Checkout'
                  WHEN al.entity_type = 'PAGE' THEN COALESCE(JSON_UNQUOTE(JSON_EXTRACT(al.metadata, '$.path')), 'Pagina')
                  WHEN al.entity_type = 'PAYMENT_PREFERENCE' THEN 'Preferencia de pago'
                  ELSE NULL
                END AS entity_label,
                al.ip,
                al.created_at
         FROM AuditLogs al
         LEFT JOIN Usuarios u ON u.id = al.user_id
         LEFT JOIN Usuarios eu ON eu.id = al.entity_id AND al.entity_type = 'USER'
         LEFT JOIN Productos p ON p.id = al.entity_id AND al.entity_type = 'PRODUCT'
         WHERE ${auditWhereSql}
         ORDER BY al.created_at DESC, al.id DESC
         LIMIT :auditLimit OFFSET :auditOffset`,
        { type: QueryTypes.SELECT, replacements: auditReplacements },
      ),
      sequelize.query<NumericRow>(
        `SELECT COUNT(u.id) AS value
         FROM Usuarios u
         WHERE u.id_rol = 2`,
        { type: QueryTypes.SELECT },
      ),
      sequelize.query<RegisteredUserRow>(
        `SELECT u.id,
                u.nombre,
                u.telefono,
                u.fecha_registro
         FROM Usuarios u
         WHERE u.id_rol = 2
         ORDER BY u.fecha_registro DESC, u.id DESC
         LIMIT :limit OFFSET :offset`,
        { type: QueryTypes.SELECT, replacements: { limit: userPageSize, offset: userOffset } },
      ),
      this.getDisenosMasComprados(fechaDesde),
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
        totalDisenos: this.toNumber(disenosStatsRows[0]?.total),
        valorTotalDisenos: this.toNumber(disenosStatsRows[0]?.valor_total),
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
      auditoria: {
        totalEventos: this.toNumber(auditTotalRows[0]?.value),
        eventosPorTipo: this.toTranslatedPieItems(auditEventosPorTipoRows),
        eventosPorMes: this.toMonthlyItems(auditEventosPorMesRows),
        productosMasVistos: this.toPieItems(auditProductosMasVistosRows),
        busquedasFrecuentes: this.toPieItems(auditBusquedasFrecuentesRows),
        intervalosPrecioBuscados: this.toPieItems(auditIntervalosPrecioRows),
        disenosMasComprados,
        eventos: {
          page: auditPage,
          pageSize: auditPageSize,
          totalItems: this.toNumber(auditEventosTotalRows[0]?.value),
          totalPages: Math.max(1, Math.ceil(this.toNumber(auditEventosTotalRows[0]?.value) / auditPageSize)),
          data: this.toAuditRecentEventItems(auditEventosRows),
        },
        ultimosEventos: this.toAuditRecentEventItems(auditEventosRows),
      },
      usuariosRegistrados: {
        page: userPage,
        pageSize: userPageSize,
        totalItems: this.toNumber(usuariosRegistradosTotalRows[0]?.value),
        totalPages: Math.max(1, Math.ceil(this.toNumber(usuariosRegistradosTotalRows[0]?.value) / userPageSize)),
        data: this.toRegisteredUsers(usuariosRegistradosPaginaRows),
      },
    };
  }
}
