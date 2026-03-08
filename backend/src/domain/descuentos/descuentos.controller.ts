import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBody,
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/utils/auth.guard';
import { Role1Guard } from 'src/auth/utils/role1.guard';
import { DescuentosService } from './descuentos.service';
import {
  CreateDescuentoDto,
  DescuentoResponseDto,
  SuccessDeleteDescuentoDto,
  UpdateDescuentoDto,
} from './DTOs/descuentos.dto';
import type { DescuentoEstado, DescuentoFilters, DescuentoResponse, DescuentoTipo } from './types/descuentos.types';

@ApiTags('Descuentos')
@Controller('descuentos')
@UseGuards(AuthGuard, Role1Guard)
@ApiCookieAuth('cookieAuth')
export class DescuentosController {
  constructor(private readonly descuentosService: DescuentosService) {}

  @Get()
  @ApiQuery({ name: 'tipo', required: false, enum: ['producto', 'subcategoria', 'categoria'] })
  @ApiQuery({ name: 'estado', required: false, enum: ['no_empezado', 'vigente', 'terminado'] })
  @ApiOkResponse({ type: DescuentoResponseDto, isArray: true })
  async findAll(
    @Query('tipo') tipo?: string,
    @Query('estado') estado?: string,
  ): Promise<DescuentoResponse[]> {
    return this.descuentosService.findAll({
      tipo: this.parseTipo(tipo),
      estado: this.parseEstado(estado),
    });
  }

  @Get(':id')
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiOkResponse({ type: DescuentoResponseDto })
  async findById(@Param('id') id: string): Promise<DescuentoResponse> {
    return this.descuentosService.findById(this.parseId(id, 'id'));
  }

  @Post()
  @ApiBody({ type: CreateDescuentoDto })
  @ApiCreatedResponse({ type: DescuentoResponseDto })
  async create(@Body() body: CreateDescuentoDto): Promise<DescuentoResponse> {
    return this.descuentosService.create(body);
  }

  @Put(':id')
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiBody({ type: UpdateDescuentoDto })
  @ApiOkResponse({ type: DescuentoResponseDto })
  async update(@Param('id') id: string, @Body() body: UpdateDescuentoDto): Promise<DescuentoResponse> {
    return this.descuentosService.update(this.parseId(id, 'id'), body);
  }

  @Delete(':id')
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiOkResponse({ type: SuccessDeleteDescuentoDto })
  async delete(@Param('id') id: string): Promise<SuccessDeleteDescuentoDto> {
    return this.descuentosService.delete(this.parseId(id, 'id'));
  }

  private parseId(value: string, fieldName: string): number {
    const parsed = Number(value);
    if (!Number.isInteger(parsed) || parsed < 1) {
      throw new BadRequestException(`${fieldName} inválido`);
    }
    return parsed;
  }

  private parseTipo(value?: string): DescuentoTipo | undefined {
    if (!value) {
      return undefined;
    }

    if (value === 'producto' || value === 'subcategoria' || value === 'categoria') {
      return value;
    }

    throw new BadRequestException('tipo inválido');
  }

  private parseEstado(value?: string): DescuentoEstado | undefined {
    if (!value) {
      return undefined;
    }

    if (value === 'no_empezado' || value === 'vigente' || value === 'terminado') {
      return value;
    }

    throw new BadRequestException('estado inválido');
  }
}
