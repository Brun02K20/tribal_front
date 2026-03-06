
import { Controller, Get, Param } from '@nestjs/common';
import { ApiOkResponse, ApiTags, ApiParam } from '@nestjs/swagger';
import { CiudadesService } from './ciudades.service';
import { CiudadDto } from './DTOs/ciudades.dto';
import type { CiudadListResponse } from './types/ciudades.types';

@ApiTags('Ciudades')
@Controller('ciudades')
export class CiudadesController {
  constructor(private readonly ciudadesService: CiudadesService) {}

  @Get()
  @ApiOkResponse({ type: CiudadDto, isArray: true })
  async findAll(): Promise<CiudadListResponse> {
    return this.ciudadesService.findAll();
  }

  @Get(':id')
  @ApiOkResponse({ type: CiudadDto })
  @ApiParam({ name: 'id', type: Number, description: 'ID of the ciudad', example: 1 })
  async findById(@Param('id') id: number): Promise<CiudadListResponse[0]> {
    return this.ciudadesService.findById(id);
  }

  @Get('provincia/:id_provincia')
  @ApiOkResponse({ type: CiudadDto, isArray: true })
  @ApiParam({ name: 'id_provincia', type: Number, description: 'ID of the provincia', example: 1 })
  async findByProvinciaId(@Param('id_provincia') id_provincia: number): Promise<CiudadListResponse> {
    return this.ciudadesService.findByProvinciaId(id_provincia);
  }
}
