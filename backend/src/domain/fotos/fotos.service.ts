import { Injectable } from '@nestjs/common';
import { Fotos } from './models/Fotos';
import { CreateProductFotosDto } from './DTOs/fotos.dto';

@Injectable()
export class FotosService {
	async bulkCreate(fotos: CreateProductFotosDto[]): Promise<{ id: number; url: string; id_producto: number;}[]> {
		const createdFotos = await Fotos.bulkCreate(fotos);
		return createdFotos.map(foto => ({
			id: foto.id,
			url: foto.url,
			id_producto: foto.id_producto,
		}));
	}
}
