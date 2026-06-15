import { Injectable } from '@nestjs/common';
import { Fotos } from './models/Fotos';
import { CreateProductFotosDto, CreateBlogFotosDto } from './DTOs/fotos.dto';

@Injectable()
export class FotosService {
    async bulkCreate(fotos: CreateProductFotosDto[]): Promise<{ id: number; url: string; id_producto: number }[]> {
        const createdFotos = await Fotos.bulkCreate(fotos);
        return createdFotos.map(foto => ({
            id: foto.id,
            url: foto.url,
            id_producto: foto.id_producto!,
        }));
    }

    async bulkCreateForBlog(fotos: CreateBlogFotosDto[]): Promise<{ id: number; url: string; id_blog: number }[]> {
        const createdFotos = await Fotos.bulkCreate(
            fotos.map(f => ({ url: f.url, id_blog: f.id_blog, id_producto: null })),
        );
        return createdFotos.map(foto => ({
            id: foto.id,
            url: foto.url,
            id_blog: foto.id_blog!,
        }));
    }

    async deleteByBlogId(idBlog: number): Promise<void> {
        await Fotos.destroy({ where: { id_blog: idBlog } });
    }

    async replaceProductFotos(idProducto: number, fotos: CreateProductFotosDto[]): Promise<void> {
        await Fotos.destroy({ where: { id_producto: idProducto } });
        if (fotos.length) {
            await Fotos.bulkCreate(fotos);
        }
    }
}
