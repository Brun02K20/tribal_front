import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { FotosService } from 'src/domain/fotos/fotos.service';
import { Productos } from 'src/domain/productos/models/Productos';
import { CreateUpdateDisenoDto, GetDisenoDto } from './DTOs/disenos.dto';
import { Disenos } from './models/Disenos';

@Injectable()
export class DisenosService {
    constructor(private readonly fotosService: FotosService) {}

    private mapDiseno(diseno: Disenos): GetDisenoDto {
        return {
            id: diseno.id,
            nombre: diseno.nombre,
            precio: Number(diseno.precio),
            url_foto: diseno.url_foto,
            id_producto: diseno.id_producto,
        };
    }

    async findByProducto(idProducto: number): Promise<GetDisenoDto[]> {
        const disenos = await Disenos.findAll({
            where: { id_producto: idProducto },
            order: [['id', 'ASC']],
        });
        return disenos.map((diseno) => this.mapDiseno(diseno));
    }

    async findById(idDiseno: number): Promise<GetDisenoDto> {
        const diseno = await Disenos.findByPk(idDiseno);
        if (!diseno) {
            throw new NotFoundException('Diseño no encontrado');
        }
        return this.mapDiseno(diseno);
    }

    async create(
        idProducto: number,
        data: CreateUpdateDisenoDto,
        urlFoto: string | null,
        options: { syncFoto?: boolean } = {},
    ): Promise<GetDisenoDto> {
        const producto = await Productos.findByPk(idProducto);
        if (!producto) {
            throw new NotFoundException('Producto no encontrado');
        }

        const diseno = await Disenos.create({
            id_producto: idProducto,
            nombre: data.nombre.trim(),
            precio: Number(data.precio),
            url_foto: urlFoto,
        });

        if (urlFoto && options.syncFoto !== false) {
            await this.fotosService.bulkCreate([{ id_producto: idProducto, url: urlFoto }]);
        }

        return this.mapDiseno(diseno);
    }

    async update(
        idDiseno: number,
        data: CreateUpdateDisenoDto,
        urlFoto?: string | null,
        options: { syncFoto?: boolean } = {},
    ): Promise<GetDisenoDto> {
        const diseno = await Disenos.findByPk(idDiseno);
        if (!diseno) {
            throw new NotFoundException('Diseño no encontrado');
        }

        const previousUrl = diseno.url_foto;
        await diseno.update({
            nombre: data.nombre.trim(),
            precio: Number(data.precio),
            url_foto: urlFoto === undefined ? diseno.url_foto : urlFoto,
        });

        if (options.syncFoto !== false && urlFoto && previousUrl && urlFoto !== previousUrl) {
            await this.fotosService.deleteProductFotoByUrl(diseno.id_producto, previousUrl);
            await this.fotosService.bulkCreate([{ id_producto: diseno.id_producto, url: urlFoto }]);
        } else if (options.syncFoto !== false && urlFoto && urlFoto !== previousUrl) {
            await this.fotosService.bulkCreate([{ id_producto: diseno.id_producto, url: urlFoto }]);
        }

        return this.mapDiseno(diseno);
    }

    async syncUniqueDesign(idProducto: number, data: CreateUpdateDisenoDto): Promise<GetDisenoDto> {
        const disenos = await Disenos.findAll({
            where: { id_producto: idProducto },
            order: [['id', 'ASC']],
        });

        const [mainDiseno, ...extraDisenos] = disenos;
        await Promise.all(extraDisenos.map((diseno) => diseno.destroy()));

        if (!mainDiseno) {
            return this.create(idProducto, data, null, { syncFoto: false });
        }

        await mainDiseno.update({
            nombre: data.nombre.trim(),
            precio: Number(data.precio),
            url_foto: null,
        });

        return this.mapDiseno(mainDiseno);
    }

    async delete(idDiseno: number): Promise<{ id: number; message: string; url_foto: string | null; id_producto: number }> {
        const diseno = await Disenos.findByPk(idDiseno);
        if (!diseno) {
            throw new NotFoundException('Diseño no encontrado');
        }

        const payload = {
            id: diseno.id,
            url_foto: diseno.url_foto,
            id_producto: diseno.id_producto,
        };

        if (diseno.url_foto) {
            await this.fotosService.deleteProductFotoByUrl(diseno.id_producto, diseno.url_foto);
        }
        await diseno.destroy();

        return {
            ...payload,
            message: 'Diseño eliminado exitosamente',
        };
    }

    parsePayload(body: Record<string, unknown>): CreateUpdateDisenoDto {
        const raw = body.diseno ?? body.data ?? body.payload ?? body;
        let data: Record<string, unknown>;

        if (typeof raw === 'string') {
            try {
                const parsed = JSON.parse(raw) as unknown;
                if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
                    throw new Error('invalid');
                }
                data = parsed as Record<string, unknown>;
            } catch {
                throw new BadRequestException('El JSON del diseño es inválido');
            }
        } else if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
            data = raw as Record<string, unknown>;
        } else {
            throw new BadRequestException('Los datos del diseño son obligatorios');
        }

        const nombre = typeof data.nombre === 'string' ? data.nombre.trim() : '';
        const precio = Number(data.precio);

        if (!nombre) {
            throw new BadRequestException('El nombre del diseño es obligatorio');
        }

        if (!Number.isFinite(precio) || precio <= 0) {
            throw new BadRequestException('El precio del diseño debe ser mayor a 0');
        }

        return { nombre, precio };
    }
}
