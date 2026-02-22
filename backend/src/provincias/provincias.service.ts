
import { Injectable } from '@nestjs/common';
import { Provincias } from './models/Provincias';

@Injectable()
export class ProvinciasService {
	async findAll(): Promise<Provincias[]> {
		return Provincias.findAll({
			order: [['id', 'ASC']],
		});
	}
}
