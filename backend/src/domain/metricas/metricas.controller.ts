import { BadRequestException, Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiCookieAuth, ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/utils/auth.guard';
import { Role1Guard } from 'src/auth/utils/role1.guard';
import { MetricasResponseDto } from './DTOs/metricas.dto';
import { MetricasService } from './metricas.service';
import type { MetricasResponse } from './types/metricas.types';

@ApiTags('Metricas')
@ApiCookieAuth('cookieAuth')
@UseGuards(AuthGuard, Role1Guard)
@Controller('metricas')
export class MetricasController {
  constructor(private readonly metricasService: MetricasService) {}

  private readonly allowedMonths = new Set([1, 3, 6, 12]);

  @Get()
  @ApiOperation({ summary: 'Obtener métricas del dashboard de administración' })
  @ApiQuery({
    name: 'months',
    required: false,
    type: Number,
    example: 6,
    description: 'Rango de meses a considerar. Valores permitidos: 1, 3, 6, 12',
  })
  @ApiQuery({ name: 'userPage', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'userPageSize', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'auditPage', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'auditPageSize', required: false, type: Number, example: 20 })
  @ApiQuery({ name: 'auditEventType', required: false, type: String, example: 'PRODUCT_VIEWED' })
  @ApiQuery({ name: 'auditDateFrom', required: false, type: String, example: '2026-07-01' })
  @ApiQuery({ name: 'auditDateTo', required: false, type: String, example: '2026-07-31' })
  @ApiQuery({ name: 'auditUserId', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'auditEntityType', required: false, type: String, example: 'PRODUCT' })
  @ApiQuery({ name: 'auditEntityId', required: false, type: Number, example: 61 })
  @ApiOkResponse({ type: MetricasResponseDto })
  async getDashboardMetricas(
    @Query('months') months?: string,
    @Query('userPage') userPage?: string,
    @Query('userPageSize') userPageSize?: string,
    @Query('auditPage') auditPage?: string,
    @Query('auditPageSize') auditPageSize?: string,
    @Query('auditEventType') auditEventType?: string,
    @Query('auditDateFrom') auditDateFrom?: string,
    @Query('auditDateTo') auditDateTo?: string,
    @Query('auditUserId') auditUserId?: string,
    @Query('auditEntityType') auditEntityType?: string,
    @Query('auditEntityId') auditEntityId?: string,
  ): Promise<MetricasResponse> {
    const parsedMonths = this.parseMonths(months);
    return this.metricasService.getDashboardMetricas(parsedMonths, {
      userPage: this.parsePositiveInt(userPage, 1),
      userPageSize: this.parsePositiveInt(userPageSize, 10, [10, 20, 50]),
      auditPage: this.parsePositiveInt(auditPage, 1),
      auditPageSize: this.parsePositiveInt(auditPageSize, 20, [10, 20, 50]),
      auditEventType: this.parseOptionalString(auditEventType),
      auditDateFrom: this.parseOptionalDate(auditDateFrom),
      auditDateTo: this.parseOptionalDate(auditDateTo),
      auditUserId: this.parseOptionalPositiveInt(auditUserId),
      auditEntityType: this.parseOptionalString(auditEntityType),
      auditEntityId: this.parseOptionalPositiveInt(auditEntityId),
    });
  }

  private parseMonths(value?: string): number {
    if (value === undefined || value === null || value === '') {
      return 12;
    }

    const parsed = Number(value);
    if (!Number.isInteger(parsed) || !this.allowedMonths.has(parsed)) {
      throw new BadRequestException('months inválido. Valores permitidos: 1, 3, 6, 12');
    }

    return parsed;
  }

  private parsePositiveInt(value: string | undefined, fallback: number, allowed?: number[]): number {
    if (value === undefined || value === null || value === '') {
      return fallback;
    }

    const parsed = Number(value);
    if (!Number.isInteger(parsed) || parsed < 1) {
      throw new BadRequestException('Parametro numerico invalido');
    }

    if (allowed && !allowed.includes(parsed)) {
      throw new BadRequestException(`Valores permitidos: ${allowed.join(', ')}`);
    }

    return parsed;
  }

  private parseOptionalPositiveInt(value?: string): number | undefined {
    if (value === undefined || value === null || value === '') {
      return undefined;
    }

    return this.parsePositiveInt(value, 1);
  }

  private parseOptionalString(value?: string): string | undefined {
    const normalized = value?.trim();
    return normalized || undefined;
  }

  private parseOptionalDate(value?: string): string | undefined {
    if (!value) {
      return undefined;
    }

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      throw new BadRequestException('Fecha invalida');
    }

    return value;
  }
}


