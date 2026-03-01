import { BadRequestException, Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/utils/auth.guard';
import { Role1Guard } from 'src/auth/utils/role1.guard';
import { MetricasResponseDto } from './DTOs/metricas.dto';
import { MetricasService } from './metricas.service';
import type { MetricasResponse } from './types/metricas.types';

@ApiTags('Metricas')
@ApiBearerAuth('bearer')
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
  @ApiOkResponse({ type: MetricasResponseDto })
  async getDashboardMetricas(@Query('months') months?: string): Promise<MetricasResponse> {
    const parsedMonths = this.parseMonths(months);
    return this.metricasService.getDashboardMetricas(parsedMonths);
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
}
