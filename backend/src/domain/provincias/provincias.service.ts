
import { Injectable, NotFoundException } from '@nestjs/common';
import { Provincias } from './models/Provincias';
import type { ProvinciaListResponse } from './types/provincias.types';
import { mapProvincia } from 'src/utils/mappers/location.mapper';

@Injectable()
export class ProvinciasService {
	async findAll(): Promise<ProvinciaListResponse> {
		const provincias = await Provincias.findAll({
			order: [['id', 'ASC']],
		});

		return provincias.map(mapProvincia);
	}
	
	async findById(id: number): Promise<ProvinciaListResponse[0]> {
		const provincia = await Provincias.findByPk(id);

		if (!provincia) {
			throw new NotFoundException(`Provincia with id ${id} not found`);
		}

		return mapProvincia(provincia);
	}
}
