
import { Injectable, NotFoundException, BadRequestException, HttpException } from '@nestjs/common';
import { Subcategorias } from './models/Subcategorias';
import { Categorias } from 'src/categorias/models/Categorias';
import { Productos } from 'src/productos/models/Productos';
import type { SubcategoriaListResponse } from './types/subcategorias.types';
import { CategoriasService } from 'src/categorias/categorias.service';
import { CreateSubcategoriaDto, SuccessDeleteSubcategoriaDto, SubcategoriaResponseDto } from './DTOs/subcategorias.dto';

@Injectable()
export class SubcategoriasService {
    constructor (
        private readonly categoriasService: CategoriasService,
    ) {}

    async findAll(): Promise<SubcategoriaListResponse> {
        try {
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

        return subcategorias.map((subcategoria) => ({
            id: subcategoria.id,
            nombre: subcategoria.nombre,
            id_categoria: subcategoria.id_categoria,
            esActivo: subcategoria.esActivo,
        }));

        } catch (error) {
            console.error('Error fetching subcategorias:', error);
            if (error instanceof HttpException) {
                throw error;
            }
            throw new BadRequestException('Error fetching subcategorias');
        }
    }
    
    async findById(id: number): Promise<SubcategoriaResponseDto> {
        try {
            const subcategoria = await Subcategorias.findByPk(id);

            if (!subcategoria) {
                throw new NotFoundException(`Subcategoria with id ${id} not found`);
            }

            return {
                id: subcategoria.id,
                nombre: subcategoria.nombre,
                id_categoria: subcategoria.id_categoria,
                esActivo: subcategoria.esActivo,
            };
        }
        catch (error) {
            console.error(`Error fetching subcategoria with id ${id}:`, error);
            if (error instanceof HttpException) {
                throw error;
            }
            throw new BadRequestException(`Error fetching subcategoria with id ${id}`);
        }
    }

    async findByCategoriaId(categoriaId: number): Promise<SubcategoriaListResponse> {
        try {
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

            return subcategorias.map((subcategoria) => ({
                id: subcategoria.id,
                nombre: subcategoria.nombre,
                id_categoria: subcategoria.id_categoria,
                esActivo: subcategoria.esActivo,
            }));
        } catch (error) {
            console.error(`Error fetching subcategorias for categoriaId ${categoriaId}:`, error);
            if (error instanceof HttpException) {
                throw error;
            }
            throw new BadRequestException(`Error fetching subcategorias for categoriaId ${categoriaId}`);
        }
    }
    
    async create(body: CreateSubcategoriaDto): Promise<SubcategoriaResponseDto> {
        try {
            const subcategoria = await Subcategorias.create({
                nombre: body.nombre,
                id_categoria: body.id_categoria,
                esActivo: true,
            });

            return {
                id: subcategoria.id,
                nombre: subcategoria.nombre,
                id_categoria: subcategoria.id_categoria,
                esActivo: subcategoria.esActivo,
            };
        } catch (error) {
            console.error('Error creating subcategoria:', error);
            if (error instanceof HttpException) {
                throw error;
            }
            throw new BadRequestException('Error creating subcategoria');
        }
    }

    async update(id: number, body: CreateSubcategoriaDto): Promise<SubcategoriaResponseDto> {
        try {
            const subcategoria = await Subcategorias.findByPk(id);
            
            if (!subcategoria) {
                throw new NotFoundException(`Subcategoria with id ${id} not found`);
            }

            await subcategoria.update({
                nombre: body.nombre,
                id_categoria: body.id_categoria,
            });

            return {
                id: subcategoria.id,
                nombre: subcategoria.nombre,
                id_categoria: subcategoria.id_categoria,
                esActivo: subcategoria.esActivo,
            };
        } catch (error) {
            console.error(`Error updating subcategoria with id ${id}:`, error);
            if (error instanceof HttpException) {
                throw error;
            }
            throw new BadRequestException(`Error updating subcategoria with id ${id}`);
        }
    }

    async toggle(id: number): Promise<SubcategoriaResponseDto> {
        try {
            const subcategoria = await Subcategorias.findByPk(id);

            if (!subcategoria) {
                throw new NotFoundException(`Subcategoria with id ${id} not found`);
            }

            await subcategoria.update({
                esActivo: !subcategoria.esActivo,
            });

            return {
                id: subcategoria.id,
                nombre: subcategoria.nombre,
                id_categoria: subcategoria.id_categoria,
                esActivo: subcategoria.esActivo,
            };
        } catch (error) {
            console.error(`Error toggling subcategoria with id ${id}:`, error);
            if (error instanceof HttpException) {
                throw error;
            }
            throw new BadRequestException(`Error toggling subcategoria with id ${id}`);
        }
    }

    async delete(id: number): Promise<SuccessDeleteSubcategoriaDto> {
        try {
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
        } catch (error) {
            console.error(`Error deleting subcategoria with id ${id}:`, error);
            if (error instanceof HttpException) {
                throw error;
            }
            throw new BadRequestException(`Error deleting subcategoria with id ${id}`);
        }
    }
}
