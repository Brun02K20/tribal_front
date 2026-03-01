import { Injectable, NotFoundException } from '@nestjs/common';
import { Op } from 'sequelize';
import { FotosService } from 'src/fotos/fotos.service';
import { Fotos } from 'src/fotos/models/Fotos';
import { Categorias } from 'src/categorias/models/Categorias';
import { Subcategorias } from 'src/subcategorias/models/Subcategorias';
import { CreateProductFotosDto } from 'src/fotos/DTOs/fotos.dto';
import {
    GetProductDto,
    CreateUpdateProductDto,
    GetFotoDto,
    SuccessDeleteProductDto,
    ProductFiltersDto,
    PaginatedProductsResponseDto,
} from './DTOs/products.dto';
import { Productos } from './models/Productos';

const PRODUCT_INCLUDE = [
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
    },
];

@Injectable()
export class ProductosService {
    constructor(
        private readonly fotosService: FotosService,
    ) {}

    private mapFotos(producto: Productos): GetFotoDto[] {
        return (producto.fotos ?? []).map((foto) => ({
            id: foto.id,
            url: foto.url,
            id_producto: producto.id,
        }));
    }

    private mapProducto(producto: Productos, fotosOverride?: GetFotoDto[]): GetProductDto {
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
            fotos: fotosOverride ?? this.mapFotos(producto),
        };
    }

    private async findProductos(where?: Record<string, unknown>): Promise<Productos[]> {
        return Productos.findAll({
            where,
            include: PRODUCT_INCLUDE,
        });
    }

    private async findProductoOrThrow(id: number): Promise<Productos> {
        const producto = await Productos.findByPk(id, { include: PRODUCT_INCLUDE });

        if (!producto) {
            throw new NotFoundException('Producto no encontrado');
        }

        return producto;
    }

    private buildWhereByFilters(filters: ProductFiltersDto): Record<string, unknown> {
        const whereClause: Record<string, unknown> = {};

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
            whereClause.precio = { ...(whereClause.precio as object ?? {}), [Op.lte]: filters.precio_max };
        }

        return whereClause;
    }

    private normalizePage(page?: number): number {
        if (!page || Number.isNaN(page) || page < 1) {
            return 1;
        }

        return Math.trunc(page);
    }

    private normalizeAdminPageSize(pageSize?: number): number {
        const defaultPageSize = 10;

        if (!pageSize || Number.isNaN(pageSize) || pageSize < 1) {
            return defaultPageSize;
        }

        const allowedPageSizes = [10, 15, 20];
        if (!allowedPageSizes.includes(pageSize)) {
            return defaultPageSize;
        }

        return pageSize;
    }

    private async findProductosPaginated(params: {
        where?: Record<string, unknown>;
        page?: number;
        pageSize: number;
    }): Promise<PaginatedProductsResponseDto<GetProductDto>> {
        const page = this.normalizePage(params.page);
        const pageSize = params.pageSize;
        const offset = (page - 1) * pageSize;

        const { rows, count } = await Productos.findAndCountAll({
            where: params.where,
            include: PRODUCT_INCLUDE,
            order: [['id', 'DESC']],
            limit: pageSize,
            offset,
            distinct: true,
        });

        const totalItems = Number(count);
        const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

        return {
            page,
            pageSize,
            totalItems,
            totalPages,
            data: rows.map((producto) => this.mapProducto(producto)),
        };
    }

    async findAll(): Promise<GetProductDto[]> {
        const productos = await this.findProductos({ es_activo: true });
        return productos.map((producto) => this.mapProducto(producto));
    }

    async findAllPaginated(page?: number): Promise<PaginatedProductsResponseDto<GetProductDto>> {
        return this.findProductosPaginated({
            where: { es_activo: true },
            page,
            pageSize: 18,
        });
    }

    async findAllForAdmin(): Promise<GetProductDto[]> {
        const productos = await this.findProductos();
        return productos.map((producto) => this.mapProducto(producto));
    }

    async findAllForAdminPaginated(page?: number, pageSize?: number): Promise<PaginatedProductsResponseDto<GetProductDto>> {
        return this.findProductosPaginated({
            page,
            pageSize: this.normalizeAdminPageSize(pageSize),
        });
    }

    async findById(id: number): Promise<GetProductDto> {
        const producto = await this.findProductoOrThrow(id);
        return this.mapProducto(producto);
    }

    async create(createProductDto: CreateUpdateProductDto, fotos: { url: string }[]): Promise<GetProductDto> {
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

        const fotosConProductoId: CreateProductFotosDto[] = fotos.map((foto) => ({
            url: foto.url,
            id_producto: producto.id,
        }));

        if (fotosConProductoId.length > 0) {
            await this.fotosService.bulkCreate(fotosConProductoId);
        }

        return this.findById(producto.id);
    }

    async update(id: number, updateProductDto: CreateUpdateProductDto, fotos: { url: string }[]): Promise<GetProductDto> {
        const producto = await this.findProductoOrThrow(id);

        await producto.update(updateProductDto);

        if (fotos.length > 0) {
            const existingFotoIds = (producto.fotos ?? []).map((foto) => foto.id);
            if (existingFotoIds.length) {
                await Fotos.destroy({ where: { id: existingFotoIds } });
            }

            const fotosConProductoId: CreateProductFotosDto[] = fotos.map((foto) => ({
                url: foto.url,
                id_producto: id,
            }));

            await this.fotosService.bulkCreate(fotosConProductoId);
        }

        return this.findById(id);
    }

    async toggleActivateProducto(id: number): Promise<GetProductDto> {
        const producto = await this.findProductoOrThrow(id);

        await producto.update({
            es_activo: !producto.es_activo,
        });

        return this.findById(id);
    }

    async deleteProducto(id: number): Promise<SuccessDeleteProductDto> {
        const producto = await Productos.findByPk(id);

        if (!producto) {
            throw new NotFoundException(`Producto with id ${id} not found`);
        }

        await producto.update({ es_activo: false });

        return {
            id: producto.id,
            message: 'Producto eliminado exitosamente',
        };
    }

    async getProductsByCategoryIdOrSubcategoryIdOrName(filters: ProductFiltersDto): Promise<GetProductDto[]> {
        const whereClause = {
            ...this.buildWhereByFilters(filters),
            es_activo: true,
        };
        const productos = await this.findProductos(whereClause);

        if (productos.length === 0) {
            throw new NotFoundException('No se encontraron productos con los filtros proporcionados');
        }

        return productos.map((producto) => this.mapProducto(producto));
    }

    async findByFiltersPaginated(filters: ProductFiltersDto, page?: number): Promise<PaginatedProductsResponseDto<GetProductDto>> {
        return this.findProductosPaginated({
            where: {
                ...this.buildWhereByFilters(filters),
                es_activo: true,
            },
            page,
            pageSize: 18,
        });
    }

    async findByFiltersForAdminPaginated(
        filters: ProductFiltersDto,
        page?: number,
        pageSize?: number,
    ): Promise<PaginatedProductsResponseDto<GetProductDto>> {
        return this.findProductosPaginated({
            where: this.buildWhereByFilters(filters),
            page,
            pageSize: this.normalizeAdminPageSize(pageSize),
        });
    }
}
