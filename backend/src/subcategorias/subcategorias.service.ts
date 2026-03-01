
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Subcategorias } from './models/Subcategorias';
import { Categorias } from 'src/categorias/models/Categorias';
import { Productos } from 'src/productos/models/Productos';
import type { SubcategoriaListResponse } from './types/subcategorias.types';
import { CategoriasService } from 'src/categorias/categorias.service';
import { CreateSubcategoriaDto, SuccessDeleteSubcategoriaDto, SubcategoriaResponseDto } from './DTOs/subcategorias.dto';
import { mapSubcategoria } from 'src/utils/mappers/catalog.mapper';

@Injectable()
export class SubcategoriasService {
    constructor (
        private readonly categoriasService: CategoriasService,
    ) {}

    async findAll(): Promise<SubcategoriaListResponse> {
        const subcategorias = await Subcategorias.findAll({
            order: [['id', 'ASC']],
            include: [
                {
                    model: Categorias,
                    as: 'categoria',
                    attributes: ['id', 'nombre'],
                },
            ],
        });

        return subcategorias.map(mapSubcategoria);
    }
    
    async findById(id: number): Promise<SubcategoriaResponseDto> {
        const subcategoria = await Subcategorias.findByPk(id);

        if (!subcategoria) {
            throw new NotFoundException(`Subcategoria with id ${id} not found`);
        }

        return mapSubcategoria(subcategoria);
    }

    async findByCategoriaId(categoriaId: number): Promise<SubcategoriaListResponse> {
        if (!categoriaId) {
            throw new BadRequestException('categoriaId is required');
        }

        const categoria = await this.categoriasService.findById(categoriaId);

        if (!categoria) {
            throw new NotFoundException(`Categoria with id ${categoriaId} not found`);
        }

        const subcategorias = await Subcategorias.findAll({
            where: { id_categoria: categoriaId },
            order: [['id', 'ASC']],
        });

        return subcategorias.map(mapSubcategoria);
    }
    
    async create(body: CreateSubcategoriaDto): Promise<SubcategoriaResponseDto> {
        const subcategoria = await Subcategorias.create({
            nombre: body.nombre,
            id_categoria: body.id_categoria,
            esActivo: true,
        });

        return mapSubcategoria(subcategoria);
    }

    async update(id: number, body: CreateSubcategoriaDto): Promise<SubcategoriaResponseDto> {
        const subcategoria = await Subcategorias.findByPk(id);
        
        if (!subcategoria) {
            throw new NotFoundException(`Subcategoria with id ${id} not found`);
        }

        await subcategoria.update({
            nombre: body.nombre,
            id_categoria: body.id_categoria,
        });

        return mapSubcategoria(subcategoria);
    }

    async toggle(id: number): Promise<SubcategoriaResponseDto> {
        const subcategoria = await Subcategorias.findByPk(id);

        if (!subcategoria) {
            throw new NotFoundException(`Subcategoria with id ${id} not found`);
        }

        await subcategoria.update({
            esActivo: !subcategoria.esActivo,
        });

        return mapSubcategoria(subcategoria);
    }

    async delete(id: number): Promise<SuccessDeleteSubcategoriaDto> {
        const subcategoria = await Subcategorias.findByPk(id);
        if (!subcategoria) {
            throw new NotFoundException(`Subcategoria with id ${id} not found`);
        }

        await subcategoria.update({
            esActivo: false,
        });
        await Productos.update(
            { es_activo: false },
            { where: { id_subcategoria: id } },
        );

        return {
            id: subcategoria.id,
            message: 'Subcategoria deleted successfully',
        }
    }
}
