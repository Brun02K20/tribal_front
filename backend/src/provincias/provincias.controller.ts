
import { Controller, Get } from '@nestjs/common';
import { ProvinciasService } from './provincias.service';
import { Provincias } from './models/Provincias';

@Controller('provincias')
export class ProvinciasController {
  constructor(private readonly provinciasService: ProvinciasService) {}

  @Get()
  async findAll(): Promise<Provincias[]> {
    return this.provinciasService.findAll();
  }
}
