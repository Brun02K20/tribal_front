
import { Controller, Get, Param } from '@nestjs/common';
import { ApiOkResponse, ApiTags, ApiParam } from '@nestjs/swagger';
import { ProvinciasService } from './provincias.service';
import { ProvinciaDto } from './DTOs/provincias.dto';
import type { ProvinciaListResponse } from './types/provincias.types';

@ApiTags('Provincias')
@Controller('provincias')
export class ProvinciasController {
  constructor(private readonly provinciasService: ProvinciasService) {}

  @Get()
  @ApiOkResponse({ type: ProvinciaDto, isArray: true })
  async findAll(): Promise<ProvinciaListResponse> {
    return this.provinciasService.findAll();
  }

  @Get(':id')
  @ApiOkResponse({ type: ProvinciaDto })
  @ApiParam({ name: 'id', type: Number, description: 'ID of the provincia', example: 1 })
  async findById(@Param('id') id: number): Promise<ProvinciaListResponse[0]> {
    console.log(`Received request to fetch provincia with id: ${id}`);
    return this.provinciasService.findById(id);
  }
}
