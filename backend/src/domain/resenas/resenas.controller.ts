import { BadRequestException, Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { ApiCookieAuth, ApiBody, ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { AuthGuard } from 'src/auth/utils/auth.guard';
import { Role2Guard } from 'src/auth/utils/role2.guard';
import { CreateResenaDto, ResenasProductoResponseDto } from './DTOs/resenas.dto';
import { ResenasService } from './resenas.service';
import type { ResenasProductoResponse } from './types/resenas.types';

type AuthenticatedRequest = Request & {
  user?: {
    sub?: number;
  };
};

@ApiTags('Reseñas')
@Controller('resenas')
export class ResenasController {
  constructor(private readonly resenasService: ResenasService) {}

  @Get('producto/:id_producto')
  @ApiOperation({ summary: 'Obtener promedio, distribución y listado de reseñas por producto' })
  @ApiParam({ name: 'id_producto', type: Number, example: 1 })
  @ApiOkResponse({ type: ResenasProductoResponseDto })
  async getByProducto(@Param('id_producto') idProducto: string): Promise<ResenasProductoResponse> {
    return this.resenasService.getByProducto(this.parseId(idProducto, 'id_producto'));
  }

  @Post('producto/:id_producto')
  @UseGuards(AuthGuard, Role2Guard)
  @ApiCookieAuth('cookieAuth')
  @ApiOperation({ summary: 'Crear reseña (solo clientes que compraron el producto y una sola vez)' })
  @ApiParam({ name: 'id_producto', type: Number, example: 1 })
  @ApiBody({ type: CreateResenaDto })
  @ApiCreatedResponse({ type: ResenasProductoResponseDto })
  async create(
    @Param('id_producto') idProducto: string,
    @Body() body: CreateResenaDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<ResenasProductoResponse> {
    const idUsuario = Number(req.user?.sub);

    if (!Number.isInteger(idUsuario) || idUsuario < 1) {
      throw new BadRequestException('No se pudo identificar el usuario autenticado');
    }

    return this.resenasService.create(
      idUsuario,
      this.parseId(idProducto, 'id_producto'),
      Number(body.calificacion),
    );
  }

  private parseId(value: string, fieldName: string): number {
    const parsed = Number(value);
    if (!Number.isInteger(parsed) || parsed < 1) {
      throw new BadRequestException(`${fieldName} inválido`);
    }
    return parsed;
  }
}


