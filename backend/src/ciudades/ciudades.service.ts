
import { Injectable, NotFoundException, BadRequestException, HttpException } from '@nestjs/common';
import { Ciudades } from './models/Ciudades';
import type { CiudadListResponse } from './types/ciudades.types';
import { ProvinciasService } from 'src/provincias/provincias.service';

@Injectable()
export class CiudadesService {
    constructor (
        private readonly provinciasService: ProvinciasService,
    ) {}

    async findAll(): Promise<CiudadListResponse> {
        try {
            const ciudades = await Ciudades.findAll({
            order: [['id', 'ASC']],
        });

        return ciudades.map((ciudad) => ({
            id: ciudad.id,
            nombre: ciudad.nombre,
            id_provincia: ciudad.id_provincia,
        }));

        } catch (error) {
            console.error('Error fetching ciudades:', error);
            if (error instanceof HttpException) {
                throw error;
            }
            throw new BadRequestException('Error fetching ciudades');
        }
    }
    
    async findById(id: number): Promise<CiudadListResponse[0]> {
        try {
            const ciudad = await Ciudades.findByPk(id);

            if (!ciudad) {
                throw new NotFoundException(`Ciudad with id ${id} not found`);
            }

            return {
                id: ciudad.id,
                nombre: ciudad.nombre,
                id_provincia: ciudad.id_provincia,
            };
        }
        catch (error) {
            console.error(`Error fetching ciudad with id ${id}:`, error);
            if (error instanceof HttpException) {
                throw error;
            }
            throw new BadRequestException(`Error fetching ciudad with id ${id}`);
        }
    }

    async findByProvinciaId(id_provincia: number): Promise<CiudadListResponse> {
        try {
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
            return ciudades.map((ciudad) => ({
                id: ciudad.id,
                nombre: ciudad.nombre,
                id_provincia: ciudad.id_provincia,
            }));
        } catch (error) {
            console.error(`Error fetching ciudades for provincia ${id_provincia}:`, error);
            if (error instanceof HttpException) {
                throw error;
            }
            throw new BadRequestException(`Error fetching ciudades for provincia ${id_provincia}`);
        }
    }
}
