
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Ciudades } from './models/Ciudades';
import type { CiudadListResponse } from './types/ciudades.types';
import { ProvinciasService } from 'src/domain/provincias/provincias.service';
import { mapCiudad } from 'src/utils/mappers/location.mapper';

@Injectable()
export class CiudadesService {
    constructor (
        private readonly provinciasService: ProvinciasService,
    ) {}

    async findAll(): Promise<CiudadListResponse> {
        const ciudades = await Ciudades.findAll({
            order: [['id', 'ASC']],
        });

        return ciudades.map(mapCiudad);
    }
    
    async findById(id: number): Promise<CiudadListResponse[0]> {
        const ciudad = await Ciudades.findByPk(id);

        if (!ciudad) {
            throw new NotFoundException(`Ciudad with id ${id} not found`);
        }

        return mapCiudad(ciudad);
    }

    async findByProvinciaId(id_provincia: number): Promise<CiudadListResponse> {
        if (!id_provincia) {
            throw new BadRequestException('id_provincia is required');
        }

        const provinciaExists = await this.provinciasService.findById(id_provincia);
        if (!provinciaExists) {
            throw new NotFoundException(`Provincia with id ${id_provincia} not found`);
        }

        const ciudades = await Ciudades.findAll({
            where: { id_provincia },
            order: [['id', 'ASC']],
        });
        return ciudades.map(mapCiudad);
    }
}
