
import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
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
}
