
import { Injectable, NotFoundException, BadRequestException, HttpException } from '@nestjs/common';
import { Provincias } from './models/Provincias';
import type { ProvinciaListResponse } from './types/provincias.types';

@Injectable()
export class ProvinciasService {
	async findAll(): Promise<ProvinciaListResponse> {
		try {
			const provincias = await Provincias.findAll({
			order: [['id', 'ASC']],
		});

		return provincias.map((provincia) => ({
			id: provincia.id,
			nombre: provincia.nombre,
		}));
		} catch (error) {
			console.error('Error fetching provincias:', error);
			if (error instanceof HttpException) {
				throw error;
			}
			throw new BadRequestException('Error fetching provincias');
		}
	}
	
	async findById(id: number): Promise<ProvinciaListResponse[0]> {
		try {
			console.log(`Fetching provincia with id: ${id}`);
			const provincia = await Provincias.findByPk(id);

			if (!provincia) {
				throw new NotFoundException(`Provincia with id ${id} not found`);
			}

			return {
				id: provincia.id,
				nombre: provincia.nombre,
			};
		}
		catch (error) {
			console.error(`Error fetching provincia with id ${id}:`, error);
			if (error instanceof HttpException) {
				throw error;
			}
			throw new BadRequestException(`Error fetching provincia with id ${id}`);
		}
	}
}
