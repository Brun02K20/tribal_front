
import { Injectable, NotFoundException, BadRequestException, HttpException } from '@nestjs/common';
import { Categorias } from './models/Categorias';
import { Subcategorias } from 'src/subcategorias/models/Subcategorias';
import type { CategoriaListResponse } from './types/categorias.types';
import { CreateCategoriaDto, SuccessDeleteCategoriaDto } from './DTOs/categorias.dto';

@Injectable()
export class CategoriasService {
    async findAll(): Promise<CategoriaListResponse> {
        try {
            const categorias = await Categorias.findAll({
                order: [['id', 'ASC']],
                include: [
                    {
                        model: Subcategorias,
                        as: 'subcategorias',
                        attributes: ['id', 'nombre', 'id_categoria', 'esActivo'],
                    },
                ],
            });

            return categorias.map((categoria) => ({
                id: categoria.id,
                nombre: categoria.nombre,
                esActivo: categoria.esActivo,
                subcategorias: ((categoria as unknown as { subcategorias?: Subcategorias[] }).subcategorias ?? []).map((subcategoria) => ({
                    id: subcategoria.id,
                    nombre: subcategoria.nombre,
                    id_categoria: subcategoria.id_categoria,
                    esActivo: subcategoria.esActivo,
                })),
            }));
        } catch (error) {
            console.error('Error fetching categorias:', error);
            if (error instanceof HttpException) {
                throw error;
            }
            throw new BadRequestException('Error fetching categorias');
        }
    }
    
    async findById(id: number): Promise<CategoriaListResponse[0]> {
        try {
            const categoria = await Categorias.findByPk(id, {
                include: [
                    {
                        model: Subcategorias,
                        as: 'subcategorias',
                        attributes: ['id', 'nombre', 'id_categoria', 'esActivo'],
                    },
                ],
            });

            if (!categoria) {
                throw new NotFoundException(`Categoria with id ${id} not found`);
            }

            return {
                id: categoria.id,
                nombre: categoria.nombre,
                esActivo: categoria.esActivo,
                subcategorias: ((categoria as unknown as { subcategorias?: Subcategorias[] }).subcategorias ?? []).map((subcategoria) => ({
                    id: subcategoria.id,
                    nombre: subcategoria.nombre,
                    id_categoria: subcategoria.id_categoria,
                    esActivo: subcategoria.esActivo,
                })),
            };
        }
        catch (error) {
            console.error(`Error fetching categoria with id ${id}:`, error);
            if (error instanceof HttpException) {
                throw error;
            }
            throw new BadRequestException(`Error fetching categoria with id ${id}`);
        }
    }

    async createCategoria (body: CreateCategoriaDto): Promise<CategoriaListResponse[0]> {
        try {
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
        } catch (error) {
            console.error('Error creating categoria:', error);
            if (error instanceof HttpException) {
                throw error;
            }
            throw new BadRequestException('Error creating categoria');
        }
    }

    async updateCategoria (id: number, body: CreateCategoriaDto): Promise<CategoriaListResponse[0]> {
        try {
            const categoria = await Categorias.findByPk(id, {
                include: [
                    {
                        model: Subcategorias,
                        as: 'subcategorias',
                        attributes: ['id', 'nombre', 'id_categoria', 'esActivo'],
                    },
                ],
            });
            if (!categoria) {
                throw new NotFoundException(`Categoria with id ${id} not found`);
            }
            await categoria.update({
                nombre: body.nombre,
            });
            return {
                id: categoria.id,
                nombre: categoria.nombre,
                esActivo: categoria.esActivo,
                subcategorias: ((categoria as unknown as { subcategorias?: Subcategorias[] }).subcategorias ?? []).map((subcategoria) => ({
                    id: subcategoria.id,
                    nombre: subcategoria.nombre,
                    esActivo: subcategoria.esActivo,
                    id_categoria: subcategoria.id_categoria,
                })),
            };
        } catch (error) {
            console.error(`Error updating categoria with id ${id}:`, error);
            if (error instanceof HttpException) {
                throw error;
            }
            throw new BadRequestException(`Error updating categoria with id ${id}`);
        }
    }

    async toggleActivateCategoria (id: number): Promise<CategoriaListResponse[0]> {
        try {
            const categoria = await Categorias.findByPk(id, {
                include: [
                    {
                        model: Subcategorias,
                        as: 'subcategorias',
                        attributes: ['id', 'nombre', 'id_categoria', 'esActivo'],
                    },
                ],
            });
            if (!categoria) {
                throw new NotFoundException(`Categoria with id ${id} not found`);
            }
            await categoria.update({
                esActivo: !categoria.esActivo,
            });
            return {
                id: categoria.id,
                nombre: categoria.nombre,
                esActivo: categoria.esActivo,
                subcategorias: ((categoria as unknown as { subcategorias?: Subcategorias[] }).subcategorias ?? []).map((subcategoria) => ({
                    id: subcategoria.id,
                    nombre: subcategoria.nombre,
                    esActivo: subcategoria.esActivo,
                    id_categoria: subcategoria.id_categoria,
                })),
            };
        } catch (error) {
            console.error(`Error toggling activation for categoria with id ${id}:`, error);
            if (error instanceof HttpException) {
                throw error;
            }
            throw new BadRequestException(`Error toggling activation for categoria with id ${id}`);
        }
    }

    async deleteCategoria (id: number): Promise<SuccessDeleteCategoriaDto> {
        try {
            const categoria = await Categorias.findByPk(id);
            if (!categoria) {
                throw new NotFoundException(`Categoria with id ${id} not found`);
            }
            
            const subcategoriasToDelete = await Subcategorias.findAll({
                where: { id_categoria: id },
            });

            await Promise.all(subcategoriasToDelete.map((subcategoria) => subcategoria.update({ esActivo: false })));
            await categoria.update({ esActivo: false });

            return {
                id: categoria.id,
                message: 'Categoria and Subcategorias deleted successfully',
            };
        } catch (error) {
            console.error(`Error deleting categoria with id ${id}:`, error);
            if (error instanceof HttpException) {
                throw error;
            }
            throw new BadRequestException(`Error deleting categoria with id ${id}`);
        }    
    }
}
