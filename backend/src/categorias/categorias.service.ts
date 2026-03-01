
import { Injectable, NotFoundException } from '@nestjs/common';
import { Categorias } from './models/Categorias';
import { Subcategorias } from 'src/subcategorias/models/Subcategorias';
import { Productos } from 'src/productos/models/Productos';
import type { CategoriaListResponse } from './types/categorias.types';
import { CreateCategoriaDto, SuccessDeleteCategoriaDto } from './DTOs/categorias.dto';
import { mapCategoriaConSubcategorias } from 'src/utils/mappers/catalog.mapper';

@Injectable()
export class CategoriasService {
    private buildCategoriaInclude() {
        return [
            {
                model: Subcategorias,
                as: 'subcategorias',
                attributes: ['id', 'nombre', 'id_categoria', 'esActivo'],
            },
        ];
    }

    async findAll(): Promise<CategoriaListResponse> {
        const categorias = await Categorias.findAll({
            order: [['id', 'ASC']],
            include: this.buildCategoriaInclude(),
        });

        return categorias.map(mapCategoriaConSubcategorias);
    }
    
    async findById(id: number): Promise<CategoriaListResponse[0]> {
        const categoria = await Categorias.findByPk(id, {
            include: this.buildCategoriaInclude(),
        });

        if (!categoria) {
            throw new NotFoundException(`Categoria with id ${id} not found`);
        }

        return mapCategoriaConSubcategorias(categoria);
    }

    async createCategoria (body: CreateCategoriaDto): Promise<CategoriaListResponse[0]> {
        const categoria = await Categorias.create({
            nombre: body.nombre,
            esActivo: true,
        });

        return {
            id: categoria.id,
            nombre: categoria.nombre,
            esActivo: categoria.esActivo,
            subcategorias: [],
        };
    }

    async updateCategoria (id: number, body: CreateCategoriaDto): Promise<CategoriaListResponse[0]> {
        const categoria = await Categorias.findByPk(id, {
            include: this.buildCategoriaInclude(),
        });
        if (!categoria) {
            throw new NotFoundException(`Categoria with id ${id} not found`);
        }
        await categoria.update({
            nombre: body.nombre,
        });
        return mapCategoriaConSubcategorias(categoria);
    }

    async toggleActivateCategoria (id: number): Promise<CategoriaListResponse[0]> {
        const categoria = await Categorias.findByPk(id, {
            include: this.buildCategoriaInclude(),
        });
        if (!categoria) {
            throw new NotFoundException(`Categoria with id ${id} not found`);
        }
        await categoria.update({
            esActivo: !categoria.esActivo,
        });
        return mapCategoriaConSubcategorias(categoria);
    }

    async deleteCategoria (id: number): Promise<SuccessDeleteCategoriaDto> {
        const categoria = await Categorias.findByPk(id);
        if (!categoria) {
            throw new NotFoundException(`Categoria with id ${id} not found`);
        }
        
        const subcategoriasToDelete = await Subcategorias.findAll({
            where: { id_categoria: id },
        });

        const productosToDelete = await Productos.findAll({
            where: { id_categoria: id },
        });

        await Promise.all(subcategoriasToDelete.map((subcategoria) => subcategoria.update({ esActivo: false })));
        await Promise.all(productosToDelete.map((producto) => producto.update({ es_activo: false })));
        await categoria.update({ esActivo: false });

        return {
            id: categoria.id,
            message: 'Categoria and Subcategorias deleted successfully',
        };
    }
}
