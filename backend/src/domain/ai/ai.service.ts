import {
  BadGatewayException,
  BadRequestException,
  ForbiddenException,
  HttpException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { QueryTypes } from 'sequelize';
import { sequelize } from 'src/database/database';
import type { AdminAiContextSnapshot, AiAdminSummaryResponse } from './types/ai.types';

type OrderRow = {
  id: number | string;
  fecha_pedido: string | Date;
  estado_pedido: string | null;
  cliente_nombre: string | null;
  cliente_email: string | null;
  cliente_telefono: string | null;
  monto_estimado: number | string | null;
};

type OrderStateRow = {
  estado: string | null;
  cantidad: number | string | null;
};

type ProductStockRow = {
  id: number | string;
  nombre: string;
  stock: number | string | null;
};

type ClientRow = {
  nombre: string | null;
  email: string | null;
  telefono: string | null;
  fecha_registro: string | Date | null;
};

type UpdatedOrderRow = {
  id: number | string;
  fecha_modificacion: string | Date;
  estado_pedido: string | null;
  cliente_nombre: string | null;
  cliente_email: string | null;
  cliente_telefono: string | null;
};

type NumericRow = {
  value: number | string | null;
};

type PaymentSummaryRow = {
  cantidad_pagos: number | string | null;
  monto_total: number | string | null;
};

type DailyExecutionState = {
  dateKey: string;
  generatedAt: string;
};

type ParsedAiResult = {
  ocurrio: string[];
  acciones: string[];
};

type GroqChatCompletionResponse = {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
};

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly lookbackDays = 3;
  private readonly lowStockThreshold = 5;
  private readonly dailyLimitFilePath = join(process.cwd(), 'temp', 'ai-admin-last-run.json');

  async getAdminSummary(): Promise<AiAdminSummaryResponse> {
    try {
      await this.ensureDailyLimit();

      const context = await this.buildContextSnapshot();
      const prompt = this.buildPrompt(context);
      const aiResult = await this.requestAiSummary(prompt);

      await this.markDailyExecution();

      return {
        ocurrio: aiResult.ocurrio,
        acciones: aiResult.acciones,
        generadoEn: new Date().toISOString(),
        rangoDias: this.lookbackDays,
      };
    } catch (error) {
      this.logger.error('Error al generar resumen AI para admin', error instanceof Error ? error.stack : undefined);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new BadGatewayException('No se pudo generar el resumen AI en este momento');
    }
  }

  private getArgentinaDateKey(): string {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Argentina/Buenos_Aires',
    }).format(new Date());
  }

  private getSinceDate(): Date {
    return new Date(Date.now() - this.lookbackDays * 24 * 60 * 60 * 1000);
  }

  private toNumber(value: unknown): number {
    if (value === null || value === undefined) {
      return 0;
    }

    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  private toStringDate(value: unknown): string {
    if (!value) {
      return '';
    }
    const date = value instanceof Date ? value : new Date(String(value));
    return Number.isNaN(date.getTime()) ? String(value) : date.toISOString();
  }

  private normalizeAiItems(items: unknown): string[] {
    if (!Array.isArray(items)) {
      return [];
    }

    const normalized = items
      .map((item) => (typeof item === 'string' ? item.trim() : ''))
      .filter(Boolean)
      .slice(0, 12);

    return Array.from(new Set(normalized));
  }

  private async readDailyExecutionState(): Promise<DailyExecutionState | null> {
    try {
      const raw = await readFile(this.dailyLimitFilePath, 'utf8');
      const parsed = JSON.parse(raw) as Partial<DailyExecutionState>;

      if (!parsed?.dateKey || !parsed?.generatedAt) {
        return null;
      }

      return {
        dateKey: parsed.dateKey,
        generatedAt: parsed.generatedAt,
      };
    } catch {
      return null;
    }
  }

  private async ensureDailyLimit(): Promise<void> {
    const today = this.getArgentinaDateKey();
    const state = await this.readDailyExecutionState();

    if (state?.dateKey === today) {
      throw new ForbiddenException('NO PUEDES USAR ESTA ACCION');
    }
  }

  private async markDailyExecution(): Promise<void> {
    const state: DailyExecutionState = {
      dateKey: this.getArgentinaDateKey(),
      generatedAt: new Date().toISOString(),
    };

    await mkdir(dirname(this.dailyLimitFilePath), { recursive: true });
    await writeFile(this.dailyLimitFilePath, JSON.stringify(state, null, 2), 'utf8');
  }

  private async detectDateColumn(tableName: string, candidates: string[]): Promise<string | null> {
    const safeCandidates = candidates.map((name) => `'${name.replace(/'/g, "''")}'`).join(', ');

    const rows = await sequelize.query<{ name: string }>(
      `SELECT COLUMN_NAME AS name
       FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE()
         AND TABLE_NAME = :tableName
         AND COLUMN_NAME IN (${safeCandidates})`,
      {
        type: QueryTypes.SELECT,
        replacements: { tableName },
      },
    );

    const available = new Set(rows.map((row) => row.name));
    return candidates.find((candidate) => available.has(candidate)) ?? null;
  }

  private async buildContextSnapshot(): Promise<AdminAiContextSnapshot> {
    const sinceDate = this.getSinceDate();

    const [usuariosDateColumn, pedidosUpdateColumn] = await Promise.all([
      this.detectDateColumn('Usuarios', ['created_at', 'fecha_alta', 'fecha_registro', 'fecha_creacion']),
      this.detectDateColumn('Pedidos', ['updated_at', 'fecha_modificacion', 'fecha_actualizacion']),
    ]);

    const pedidosNuevosPromise = sequelize.query<OrderRow>(
      `SELECT pe.id,
              pe.fecha_pedido,
              ep.nombre AS estado_pedido,
              u.nombre AS cliente_nombre,
              u.email AS cliente_email,
              u.telefono AS cliente_telefono,
              (pe.costo_total_productos + pe.costo_envio + pe.costo_ganancia_envio) AS monto_estimado
       FROM Pedidos pe
       INNER JOIN Usuarios u ON u.id = pe.id_usuario
       LEFT JOIN EstadoPedidos ep ON ep.id = pe.id_estado_pedido
       WHERE pe.es_activo = 1
         AND pe.fecha_pedido >= :sinceDate
       ORDER BY pe.fecha_pedido DESC
       LIMIT 30`,
      {
        type: QueryTypes.SELECT,
        replacements: { sinceDate },
      },
    );

    const pedidosPorEstadoPromise = sequelize.query<OrderStateRow>(
      `SELECT ep.nombre AS estado,
              COUNT(pe.id) AS cantidad
       FROM Pedidos pe
       INNER JOIN EstadoPedidos ep ON ep.id = pe.id_estado_pedido
       WHERE pe.es_activo = 1
         AND pe.fecha_pedido >= :sinceDate
       GROUP BY ep.id, ep.nombre
       ORDER BY cantidad DESC, ep.nombre ASC`,
      {
        type: QueryTypes.SELECT,
        replacements: { sinceDate },
      },
    );

    const productosStockBajoPromise = sequelize.query<ProductStockRow>(
      `SELECT p.id, p.nombre, p.stock
       FROM Productos p
       WHERE p.es_activo = 1
         AND p.stock <= :lowStockThreshold
       ORDER BY p.stock ASC, p.nombre ASC
       LIMIT 20`,
      {
        type: QueryTypes.SELECT,
        replacements: { lowStockThreshold: this.lowStockThreshold },
      },
    );

    const pagosResumenPromise = sequelize.query<PaymentSummaryRow>(
      `SELECT COUNT(pg.id) AS cantidad_pagos,
              COALESCE(SUM(pg.monto_total), 0) AS monto_total
       FROM Pagos pg
       WHERE pg.es_activo = 1
         AND pg.aprobado = 1
         AND pg.fecha_pago >= :sinceDate`,
      {
        type: QueryTypes.SELECT,
        replacements: { sinceDate },
      },
    );

    const totalPedidosPromise = sequelize.query<NumericRow>(
      `SELECT COUNT(pe.id) AS value
       FROM Pedidos pe
       WHERE pe.es_activo = 1
         AND pe.fecha_pedido >= :sinceDate`,
      {
        type: QueryTypes.SELECT,
        replacements: { sinceDate },
      },
    );

    const clientesNuevosPromise = usuariosDateColumn
      ? sequelize.query<ClientRow>(
          `SELECT u.nombre,
                  u.email,
                  u.telefono,
                  u.\`${usuariosDateColumn}\` AS fecha_registro
           FROM Usuarios u
           WHERE u.id_rol = 2
             AND u.\`${usuariosDateColumn}\` >= :sinceDate
           ORDER BY u.\`${usuariosDateColumn}\` DESC
           LIMIT 20`,
          {
            type: QueryTypes.SELECT,
            replacements: { sinceDate },
          },
        )
      : Promise.resolve([] as ClientRow[]);

    const pedidosActualizadosPromise = pedidosUpdateColumn
      ? sequelize.query<UpdatedOrderRow>(
          `SELECT pe.id,
                  pe.\`${pedidosUpdateColumn}\` AS fecha_modificacion,
                  ep.nombre AS estado_pedido,
                  u.nombre AS cliente_nombre,
                  u.email AS cliente_email,
                  u.telefono AS cliente_telefono
           FROM Pedidos pe
           INNER JOIN Usuarios u ON u.id = pe.id_usuario
           LEFT JOIN EstadoPedidos ep ON ep.id = pe.id_estado_pedido
           WHERE pe.es_activo = 1
             AND pe.\`${pedidosUpdateColumn}\` >= :sinceDate
           ORDER BY pe.\`${pedidosUpdateColumn}\` DESC
           LIMIT 25`,
          {
            type: QueryTypes.SELECT,
            replacements: { sinceDate },
          },
        )
      : Promise.resolve([] as UpdatedOrderRow[]);

    const [
      pedidosNuevosRows,
      pedidosPorEstadoRows,
      productosStockBajoRows,
      pagosResumenRows,
      totalPedidosRows,
      clientesNuevosRows,
      pedidosActualizadosRows,
    ] = await Promise.all([
      pedidosNuevosPromise,
      pedidosPorEstadoPromise,
      productosStockBajoPromise,
      pagosResumenPromise,
      totalPedidosPromise,
      clientesNuevosPromise,
      pedidosActualizadosPromise,
    ]);

    const pagosResumen = pagosResumenRows[0];

    return {
      generadoEn: new Date().toISOString(),
      fechaDesde: sinceDate.toISOString(),
      limitacionesDatos: {
        usuariosTieneFechaRegistro: Boolean(usuariosDateColumn),
        pedidosTieneFechaModificacion: Boolean(pedidosUpdateColumn),
      },
      resumen: {
        totalPedidosUltimosDias: this.toNumber(totalPedidosRows[0]?.value),
        totalPagosAprobadosUltimosDias: this.toNumber(pagosResumen?.cantidad_pagos),
        montoPagosAprobadosUltimosDias: this.toNumber(pagosResumen?.monto_total),
        totalProductosStockBajo: productosStockBajoRows.length,
        totalNuevosClientesUltimosDias: usuariosDateColumn ? clientesNuevosRows.length : null,
        totalPedidosConEstadoActualizadoUltimosDias: pedidosUpdateColumn
          ? pedidosActualizadosRows.length
          : null,
      },
      pedidosNuevos: pedidosNuevosRows.map((row) => ({
        id: this.toNumber(row.id),
        fechaPedido: this.toStringDate(row.fecha_pedido),
        estadoPedido: row.estado_pedido?.trim() || 'Sin estado',
        clienteNombre: row.cliente_nombre?.trim() || 'Cliente sin nombre',
        clienteEmail: row.cliente_email?.trim() || '',
        clienteTelefono: row.cliente_telefono?.trim() || '',
        montoEstimado: this.toNumber(row.monto_estimado),
      })),
      pedidosPorEstado: pedidosPorEstadoRows.map((row) => ({
        estado: row.estado?.trim() || 'Sin estado',
        cantidad: this.toNumber(row.cantidad),
      })),
      productosStockBajo: productosStockBajoRows.map((row) => ({
        id: this.toNumber(row.id),
        nombre: row.nombre,
        stock: this.toNumber(row.stock),
      })),
      clientesNuevos: clientesNuevosRows.map((row) => ({
        nombre: row.nombre?.trim() || 'Cliente sin nombre',
        email: row.email?.trim() || '',
        telefono: row.telefono?.trim() || '',
        fechaRegistro: this.toStringDate(row.fecha_registro),
      })),
      pedidosConEstadoActualizado: pedidosActualizadosRows.map((row) => ({
        id: this.toNumber(row.id),
        fechaModificacion: this.toStringDate(row.fecha_modificacion),
        estadoPedido: row.estado_pedido?.trim() || 'Sin estado',
        clienteNombre: row.cliente_nombre?.trim() || 'Cliente sin nombre',
        clienteEmail: row.cliente_email?.trim() || '',
        clienteTelefono: row.cliente_telefono?.trim() || '',
      })),
    };
  }

  private buildPrompt(context: AdminAiContextSnapshot): string {
    return [
      'Sos un asistente administrativo experto de un ecommerce.',
      '',
      'Tu objetivo es ayudar al administrador con dos salidas claras y accionables:',
      '1) Que ocurrio en el ecommerce en los ultimos 3 dias.',
      '2) Acciones concretas a realizar para mantener la operación, mejorar rentabilidad y atencion al cliente.',
      '',
      'Reglas estrictas de respuesta:',
      '- Respondé SOLO JSON válido.',
      '- Estructura exacta: {"ocurrio": string[], "acciones": string[]}.',
      '- Cada item debe ser una oración breve, clara y accionable.',
      '- En acciones, priorizá reposición de stock, seguimiento de clientes nuevos y pedidos con posibles trabas.',
      '- Si faltan datos, no inventes: mencioná la limitación en "ocurrio" de forma breve.',
      '- Máximo 10 items en cada arreglo.',
      '',
      'Datos reales de BD (últimos 3 días):',
      JSON.stringify(context, null, 2),
    ].join('\n');
  }

  private extractContent(payload: GroqChatCompletionResponse): string {
    const text = payload.choices?.[0]?.message?.content?.trim();
    if (!text) {
      throw new BadGatewayException('La IA no devolvió contenido para el resumen');
    }
    return text;
  }

  private parseAiResult(rawText: string): ParsedAiResult {
    const cleaned = rawText
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/```$/i, '')
      .trim();

    let parsed: { ocurrio?: unknown; acciones?: unknown };
    try {
      parsed = JSON.parse(cleaned) as { ocurrio?: unknown; acciones?: unknown };
    } catch {
      throw new BadGatewayException('La IA devolvió un formato inválido');
    }

    const ocurrio = this.normalizeAiItems(parsed.ocurrio);
    const acciones = this.normalizeAiItems(parsed.acciones);

    if (!ocurrio.length || !acciones.length) {
      throw new BadGatewayException('La IA no devolvió datos suficientes para mostrar el resumen');
    }

    return { ocurrio, acciones };
  }

  private async requestAiSummary(prompt: string): Promise<ParsedAiResult> {
    const apiKey = process.env.GROQ_AI_API_KEY?.trim();
    const model = process.env.GROQ_AI_MODEL?.trim() || 'openai/gpt-oss-120b';

    if (!apiKey) {
      throw new BadRequestException('Falta configurar GROQ_AI_API_KEY');
    }

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0.35,
        max_tokens: 1100,
        messages: [
          {
            role: 'system',
            content:
              'Sos un asistente administrativo de ecommerce. Debes responder exclusivamente en JSON válido.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      const responseText = await response.text();
      this.logger.error(`Error Groq (${response.status}): ${responseText}`);
      throw new BadGatewayException('No se pudo obtener respuesta de GROQ');
    }

    const payload = (await response.json()) as GroqChatCompletionResponse;
    const text = this.extractContent(payload);
    return this.parseAiResult(text);
  }
}
