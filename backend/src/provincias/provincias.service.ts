
import { Injectable } from '@nestjs/common';
import { Provincias } from './models/Provincias';
import type { ProvinciaListResponse } from './types/provincias.types';

@Injectable()
export class ProvinciasService {
	async findAll(): Promise<ProvinciaListResponse> {
		const provincias = await Provincias.findAll({
			order: [['id', 'ASC']],
		});

		return provincias.map((provincia) => ({
			id: provincia.id,
			nombre: provincia.nombre,
		}));
	}
}
