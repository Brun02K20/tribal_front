import { Injectable, NotFoundException, BadRequestException, HttpException } from '@nestjs/common';
import { FotosService } from 'src/fotos/fotos.service';
import { Productos } from './models/Productos';
import { Fotos } from 'src/fotos/models/Fotos';
import { GetProductDto, CreateUpdateProductDto, GetFotoDto, SuccessDeleteProductDto, ProductFiltersDto } from './DTOs/products.dto';
import { Categorias } from 'src/categorias/models/Categorias';
import { Subcategorias } from 'src/subcategorias/models/Subcategorias';
import { CreateProductFotosDto } from 'src/fotos/DTOs/fotos.dto';
import { Op } from 'sequelize';

@Injectable()
export class ProductosService {
    constructor(
        private readonly fotosService: FotosService,
    ) { }
    
    async findAll(): Promise<GetProductDto[]> {
        try {
            const productos = await Productos.findAll({
                where: { es_activo: true },
                include: [
                    {
                        model: Fotos,
                        as: 'fotos',
                        attributes: ['id', 'url'],
                    },
                    {
                        model: Categorias,
                        as: 'categoria',
                        attributes: ['id', 'nombre'],
                    },
                    {
                        model: Subcategorias,
                        as: 'subcategoria',
                        attributes: ['id', 'nombre'],
                    }
                ],
            });

            const fotosDto: GetFotoDto[] = productos.flatMap((producto) =>
                (producto.fotos ?? []).map((foto) => ({
                    id: foto.id,
                    url: foto.url,
                    id_producto: producto.id,
                })),
            );

            return productos.map((producto) => ({
                id: producto.id,
                nombre: producto.nombre,
                descripcion: producto.descripcion,
                categoria: {
                    id: producto.categoria?.id ?? 0,
                    nombre: producto.categoria?.nombre ?? '',
                },
                subcategoria: {
                    id: producto.subcategoria?.id ?? 0,
                    nombre: producto.subcategoria?.nombre ?? '',
                },
                precio: producto.precio,
                stock: producto.stock,
                ancho: producto.ancho,
                alto: producto.alto,
                profundo: producto.profundo,
                peso_gramos: producto.peso_gramos,
                es_activo: producto.es_activo,
                fotos: fotosDto.filter((foto) => foto.id_producto === producto.id),
            }));
            

        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new BadRequestException('Error fetching productos');
        }
        
    }
    
    async findById(id: number): Promise<GetProductDto> {
        try {
            const producto = await Productos.findByPk(id, {
                include: [
                    {
                        model: Fotos,
                        as: 'fotos',
                        attributes: ['id', 'url'],
                    },
                    {
                        model: Categorias,
                        as: 'categoria',
                        attributes: ['id', 'nombre'],
                    },
                    {
                        model: Subcategorias,
                        as: 'subcategoria',
                        attributes: ['id', 'nombre'],
                    }
                ],
            });

            if (!producto) {
                throw new NotFoundException('Producto no encontrado');
            }

            const fotosDto: GetFotoDto[] = (producto.fotos ?? []).map((foto) => ({
                id: foto.id,
                url: foto.url,
                id_producto: producto.id,
            }));

            return {
                id: producto.id,
                nombre: producto.nombre,
                descripcion: producto.descripcion,
                categoria: {
                    id: producto.categoria?.id ?? 0,
                    nombre: producto.categoria?.nombre ?? '',
                },
                subcategoria: {
                    id: producto.subcategoria?.id ?? 0,
                    nombre: producto.subcategoria?.nombre ?? '',
                },
                precio: producto.precio,
                stock: producto.stock,
                ancho: producto.ancho,
                alto: producto.alto,
                profundo: producto.profundo,
                peso_gramos: producto.peso_gramos,
                es_activo: producto.es_activo,
                fotos: fotosDto.filter((foto) => foto.id_producto === producto.id),
            };
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new BadRequestException('Error fetching producto');
        }
    }

    async create(createProductDto: CreateUpdateProductDto, fotos: {url: string}[]): Promise<GetProductDto> {
        try {
            // 1. Crear el producto
            const producto = await Productos.create({
                nombre: createProductDto.nombre,
                descripcion: createProductDto.descripcion,
                precio: createProductDto.precio,
                stock: createProductDto.stock,
                id_categoria: createProductDto.id_categoria,
                id_subcategoria: createProductDto.id_subcategoria,
                ancho: createProductDto.ancho,
                alto: createProductDto.alto,
                profundo: createProductDto.profundo,
                peso_gramos: createProductDto.peso_gramos,
                es_activo: true,
            });

            // 2. Obtener el ID del producto recién creado
            const id_producto = producto.id;

            // 3. A todas las fotos, asignarles el ID del producto  
            const fotosConProductoId: CreateProductFotosDto[] = fotos.map((foto) => ({
                url: foto.url,
                id_producto,
            }));

            // 4. Crear las fotos en la base de datos
            const createdFotos = fotosConProductoId.length > 0
                ? await this.fotosService.bulkCreate(fotosConProductoId)
                : [];

            // 5. Devolver el producto creado con sus fotos
            return {
                id: producto.id,
                nombre: producto.nombre,
                descripcion: producto.descripcion,
                categoria: {
                    id: producto.categoria?.id ?? 0,
                    nombre: producto.categoria?.nombre ?? '',
                },
                subcategoria: {
                    id: producto.subcategoria?.id ?? 0,
                    nombre: producto.subcategoria?.nombre ?? '',
                },
                precio: producto.precio,
                stock: producto.stock,
                ancho: producto.ancho,
                alto: producto.alto,
                profundo: producto.profundo,
                peso_gramos: producto.peso_gramos,
                es_activo: producto.es_activo,
                fotos: createdFotos.map((foto) => ({
                    id: foto.id,
                    url: foto.url,
                    id_producto: foto.id_producto,
                })),
            };
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            console.error('Error creating producto:', error);
            throw new BadRequestException('Error creating producto');
        }
    }

    async update(id: number, updateProductDto: CreateUpdateProductDto,  fotos: {url: string}[]): Promise<GetProductDto> {
        try {
            const producto = await Productos.findByPk(id, {
                include: [
                    {
                        model: Fotos,
                        as: 'fotos',
                        attributes: ['id', 'url'],
                    },
                    {
                        model: Categorias,
                        as: 'categoria',
                        attributes: ['id', 'nombre'],
                    },
                    {
                        model: Subcategorias,
                        as: 'subcategoria',
                        attributes: ['id', 'nombre'],
                    }
                ],
            });

            if (!producto) {
                throw new NotFoundException('Producto no encontrado');
            }

            await producto.update(updateProductDto);

            const existingFotos = (producto.fotos ?? []).map((foto) => ({
                id: foto.id,
                url: foto.url,
                id_producto: foto.id_producto,
            }));

            // 2. Borrar las fotos existentes del producto si es que vienen nuevas
            if (fotos.length > 0) {
                const existingFotoIds = existingFotos.map((foto) => foto.id);
                await Fotos.destroy({ where: { id: existingFotoIds } });
            }
            

            // 3. Crear las nuevas fotos (si se enviaron)
            let createdFotos: GetFotoDto[] = existingFotos;
            if (fotos.length > 0) {
                const fotosConProductoId: CreateProductFotosDto[] = fotos.map((foto) => ({
                    url: foto.url,
                    id_producto: id,
                }));
                createdFotos = await this.fotosService.bulkCreate(fotosConProductoId);
            }

            // 4. Devolver el producto actualizado con sus fotos
            return {
                id: producto.id,
                nombre: producto.nombre,
                descripcion: producto.descripcion,
                categoria: {
                    id: producto.categoria?.id ?? 0,
                    nombre: producto.categoria?.nombre ?? '',
                },
                subcategoria: {
                    id: producto.subcategoria?.id ?? 0,
                    nombre: producto.subcategoria?.nombre ?? '',
                },
                precio: producto.precio,
                stock: producto.stock,
                ancho: producto.ancho,
                alto: producto.alto,
                profundo: producto.profundo,
                peso_gramos: producto.peso_gramos,
                es_activo: producto.es_activo,
                fotos: createdFotos,
            };
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            console.error('Error updating producto:', error);
            throw new BadRequestException('Error updating producto');
        }
    }

    async toggleActivateProducto(id: number): Promise<GetProductDto> {
        try {
            const producto = await Productos.findByPk(id, {
                include: [
                    {
                        model: Fotos,
                        as: 'fotos',
                        attributes: ['id', 'url'],
                    },
                    {
                        model: Categorias,
                        as: 'categoria',
                        attributes: ['id', 'nombre'],
                    },
                    {
                        model: Subcategorias,
                        as: 'subcategoria',
                        attributes: ['id', 'nombre'],
                    }
                ],
            });
            if (!producto) {
                throw new NotFoundException(`Producto with id ${id} not found`);
            }
            await producto.update({
                es_activo: !producto.es_activo,

            });

            return {
                id: producto.id,
                nombre: producto.nombre,
                descripcion: producto.descripcion,
                categoria: {
                    id: producto.categoria?.id ?? 0,
                    nombre: producto.categoria?.nombre ?? '',
                },
                subcategoria: {
                    id: producto.subcategoria?.id ?? 0,
                    nombre: producto.subcategoria?.nombre ?? '',
                },
                precio: producto.precio,
                stock: producto.stock,
                ancho: producto.ancho,
                alto: producto.alto,
                profundo: producto.profundo,
                peso_gramos: producto.peso_gramos,
                es_activo: producto.es_activo,
                fotos: (producto.fotos ?? []).map((foto) => ({
                    id: foto.id,
                    url: foto.url,
                    id_producto: foto.id_producto,
                })),
            };
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new BadRequestException(`Error toggling activation for producto with id ${id}`);
        }
    }

    async deleteProducto(id: number): Promise<SuccessDeleteProductDto> {
        try {
            const producto = await Productos.findByPk(id);
            if (!producto) {
                throw new NotFoundException(`Producto with id ${id} not found`);
            }
            await producto.update({ es_activo: false });
            return {
                id: producto.id,
                message: 'Producto eliminado exitosamente',
            };
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new BadRequestException(`Error deleting producto with id ${id}`);
        }
    }

    async getProductsByCategoryIdOrSubcategoryIdOrName(filters: ProductFiltersDto): Promise<GetProductDto[]> {
        try {
            const whereClause: any = { es_activo: true };

            if (filters.id_categoria) {
                whereClause.id_categoria = filters.id_categoria;
            }

            if (filters.id_subcategoria) {
                whereClause.id_subcategoria = filters.id_subcategoria;
            }

            if (filters.nombre) {
                whereClause.nombre = { [Op.like]: `%${filters.nombre}%` };
            }

            if (filters.precio_min) {
                whereClause.precio = { [Op.gte]: filters.precio_min };
            }

            if (filters.precio_max) {
                whereClause.precio = { ...whereClause.precio, [Op.lte]: filters.precio_max };
            }

            const productos = await Productos.findAll({
                where: whereClause,
                include: [
                    {
                        model: Fotos,
                        as: 'fotos',
                        attributes: ['id', 'url'],
                    },
                    {
                        model: Categorias,
                        as: 'categoria',
                        attributes: ['id', 'nombre'],
                    },
                    {
                        model: Subcategorias,
                        as: 'subcategoria',
                        attributes: ['id', 'nombre'],
                    }
                ],
            });

            const fotosDto: GetFotoDto[] = productos.flatMap((producto) =>
                (producto.fotos ?? []).map((foto) => ({
                    id: foto.id,
                    url: foto.url,
                    id_producto: producto.id,
                })),
            );

            if (productos.length === 0) {
                throw new NotFoundException('No se encontraron productos con los filtros proporcionados');
            }

            return productos.map((producto) => ({
                id: producto.id,
                nombre: producto.nombre,
                descripcion: producto.descripcion,
                categoria: {
                    id: producto.categoria?.id ?? 0,
                    nombre: producto.categoria?.nombre ?? '',
                },
                subcategoria: {
                    id: producto.subcategoria?.id ?? 0,
                    nombre: producto.subcategoria?.nombre ?? '',
                },
                precio: producto.precio,
                stock: producto.stock,
                ancho: producto.ancho,
                alto: producto.alto,
                profundo: producto.profundo,
                peso_gramos: producto.peso_gramos,
                es_activo: producto.es_activo,
                fotos: fotosDto.filter((foto) => foto.id_producto === producto.id),
            }));
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
                throw new BadRequestException('Error fetching productos by category or subcategory or name');
        }
    }


}