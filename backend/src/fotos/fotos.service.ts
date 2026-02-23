import { Injectable } from '@nestjs/common';
import { Fotos } from './models/Fotos';

@Injectable()
export class FotosService {
	async create(url: string, id_producto: number | null = null) {
		const foto = await Fotos.create({
			url,
			id_producto,
		});

		return {
			id: foto.id,
			url: foto.url,
			id_producto: foto.id_producto,
			es_activo: foto.es_activo,
		};
	}
}
