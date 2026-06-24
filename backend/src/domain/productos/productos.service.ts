import { Injectable, NotFoundException, OnApplicationBootstrap } from '@nestjs/common';
import { Op, literal } from 'sequelize';
import type { Includeable, Order } from 'sequelize';
import { OrdenConfigCategoria, OrdenConfigSubcategoria } from './models/OrdenConfig';
import { BusquedaSemanticaService } from 'src/domain/busqueda-semantica/busqueda-semantica.service';
import { FotosService } from 'src/domain/fotos/fotos.service';
import { Fotos } from 'src/domain/fotos/models/Fotos';
import { Categorias } from 'src/domain/categorias/models/Categorias';
import { Subcategorias } from 'src/domain/subcategorias/models/Subcategorias';
import { Disenos } from 'src/domain/disenos/models/Disenos';
import { DescuentosService } from 'src/domain/descuentos/descuentos.service';
import type { DescuentoAplicado } from 'src/domain/descuentos/types/descuentos.types';
import { CreateProductFotosDto } from 'src/domain/fotos/DTOs/fotos.dto';
import {
    GetProductDto,
    CreateUpdateProductDto,
    GetFotoDto,
    SuccessDeleteProductDto,
    ProductFiltersDto,
    PaginatedProductsResponseDto,
} from './DTOs/products.dto';
import { Productos } from './models/Productos';

export type OrdenConfigItemDto = {
    id_categoria: number;
    posicion: number;
    subcategorias: { id_subcategoria: number; posicion: number }[];
};

const PRODUCT_INCLUDE: Includeable[] = [
    {
        model: Fotos,
        as: 'fotos',
        attributes: ['id', 'url'],
        separate: true,
        order: [['id', 'ASC']] as Order,
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
    {
        model: Disenos,
        as: 'disenos',
        attributes: ['id', 'nombre', 'precio', 'stock', 'url_foto', 'id_producto'],
    },
];

@Injectable()
export class ProductosService implements OnApplicationBootstrap {
    constructor(
        private readonly fotosService: FotosService,
        private readonly descuentosService: DescuentosService,
        private readonly semanticaService: BusquedaSemanticaService,
    ) {}

    async onApplicationBootstrap(): Promise<void> {
        await OrdenConfigCategoria.sync({ force: false });
        await OrdenConfigSubcategoria.sync({ force: false });
    }

    async getOrdenConfig(): Promise<OrdenConfigItemDto[]> {
        const rows = await OrdenConfigCategoria.findAll({
            include: [{ model: OrdenConfigSubcategoria, as: 'subcategorias' }],
            order: [
                ['posicion', 'ASC'],
                [{ model: OrdenConfigSubcategoria, as: 'subcategorias' }, 'posicion', 'ASC'],
            ],
        });
        return rows.map((c) => ({
            id_categoria: c.id_categoria,
            posicion: c.posicion,
            subcategorias: (c.subcategorias ?? []).map((s) => ({
                id_subcategoria: s.id_subcategoria,
                posicion: s.posicion,
            })),
        }));
    }

    async setOrdenConfig(items: OrdenConfigItemDto[]): Promise<OrdenConfigItemDto[]> {
        await OrdenConfigSubcategoria.destroy({ where: {} });
        await OrdenConfigCategoria.destroy({ where: {} });

        for (const item of items) {
            await OrdenConfigCategoria.create({ id_categoria: item.id_categoria, posicion: item.posicion });
            for (const sub of item.subcategorias) {
                await OrdenConfigSubcategoria.create({
                    id_categoria: item.id_categoria,
                    id_subcategoria: sub.id_subcategoria,
                    posicion: sub.posicion,
                });
            }
        }

        return this.getOrdenConfig();
    }

    private mapFotos(producto: Productos): GetFotoDto[] {
        return (producto.fotos ?? []).map((foto) => ({
            id: foto.id,
            url: foto.url,
            id_producto: producto.id,
        }));
    }

    private mapProducto(producto: Productos, fotosOverride?: GetFotoDto[], descuento?: DescuentoAplicado): GetProductDto {
        const precioBase = Number(producto.precio);
        const precioFinal = descuento
            ? Number((precioBase * (1 - descuento.porcentaje / 100)).toFixed(2))
            : precioBase;

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
            precio_final: precioFinal,
            stock: producto.stock,
            ancho: producto.ancho,
            alto: producto.alto,
            profundo: producto.profundo,
            peso_gramos: producto.peso_gramos,
            es_activo: producto.es_activo,
            es_unico: producto.es_unico,
            fotos: fotosOverride ?? this.mapFotos(producto),
            disenos: (producto.disenos ?? []).map((diseno) => ({
                id: diseno.id,
                nombre: diseno.nombre,
                precio: Number(diseno.precio),
                stock: Number(diseno.stock),
                url_foto: diseno.url_foto,
                id_producto: diseno.id_producto,
            })),
            descuento_aplicado: descuento,
        };
    }

    private async mapProductosWithDiscount(productos: Productos[]): Promise<GetProductDto[]> {
        const descuentosAplicados = await this.descuentosService.resolveEffectiveDiscountsForProducts(productos);
        return productos.map((producto) => this.mapProducto(producto, undefined, descuentosAplicados.get(producto.id)));
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

    private async buildOrder(): Promise<Order> {
        const configs = await OrdenConfigCategoria.findAll({
            include: [{ model: OrdenConfigSubcategoria, as: 'subcategorias' }],
            order: [
                ['posicion', 'ASC'],
                [{ model: OrdenConfigSubcategoria, as: 'subcategorias' }, 'posicion', 'ASC'],
            ],
        });

        if (!configs.length) return [['id', 'DESC']];

        // CASE para prioridad de categoría: cat en pos 1 → 0, pos 2 → 1, resto → 999
        const catCases = configs.map((c) => `WHEN \`Productos\`.\`id_categoria\` = ${c.id_categoria} THEN ${c.posicion - 1}`).join(' ');
        const catExpr = `CASE ${catCases} ELSE 999 END`;

        // CASE para prioridad de subcategoría dentro de cada categoría
        const subcatCases: string[] = [];
        for (const c of configs) {
            for (const s of c.subcategorias ?? []) {
                subcatCases.push(
                    `WHEN \`Productos\`.\`id_categoria\` = ${c.id_categoria} AND \`Productos\`.\`id_subcategoria\` = ${s.id_subcategoria} THEN ${s.posicion - 1}`,
                );
            }
        }
        const subcatExpr = subcatCases.length
            ? `CASE ${subcatCases.join(' ')} ELSE 999 END`
            : null;

        const order: Order = [[literal(catExpr), 'ASC']];
        if (subcatExpr) order.push([literal(subcatExpr), 'ASC']);
        order.push(['id', 'DESC']);
        return order;
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
            order: await this.buildOrder(),
            limit: pageSize,
            offset,
            distinct: true,
        });

        const totalItems = Number(count);
        const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
        const descuentosAplicados = await this.descuentosService.resolveEffectiveDiscountsForProducts(rows);

        return {
            page,
            pageSize,
            totalItems,
            totalPages,
            data: rows.map((producto) => this.mapProducto(producto, undefined, descuentosAplicados.get(producto.id))),
        };
    }

    async findAll(): Promise<GetProductDto[]> {
        const productos = await this.findProductos({ es_activo: true });
        return this.mapProductosWithDiscount(productos);
    }

    async findAllPaginated(page?: number): Promise<PaginatedProductsResponseDto<GetProductDto>> {
        return this.findProductosPaginated({
            where: { es_activo: true },
            page,
            pageSize: 12,
        });
    }

    async findAllForAdmin(): Promise<GetProductDto[]> {
        const productos = await this.findProductos();
        return this.mapProductosWithDiscount(productos);
    }

    async findAllForAdminPaginated(page?: number, pageSize?: number): Promise<PaginatedProductsResponseDto<GetProductDto>> {
        return this.findProductosPaginated({
            page,
            pageSize: this.normalizeAdminPageSize(pageSize),
        });
    }

    async findById(id: number): Promise<GetProductDto> {
        const producto = await this.findProductoOrThrow(id);
        const descuentosAplicados = await this.descuentosService.resolveEffectiveDiscountsForProducts([producto]);
        return this.mapProducto(producto, undefined, descuentosAplicados.get(producto.id));
    }

    private buildEmbeddingText(nombre: string, descripcion: string): string {
        // El nombre se repite 3 veces para darle mayor peso semántico frente a la descripción
        return `${nombre} ${nombre} ${nombre} ${descripcion}`.trim();
    }

    private async saveEmbedding(producto: Productos): Promise<void> {
        const vec = await this.semanticaService.generateEmbedding(
            this.buildEmbeddingText(producto.nombre, producto.descripcion),
        );
        if (vec) await producto.update({ embedding: JSON.stringify(vec) });
    }

    async reindexarTodos(): Promise<{ total: number; indexados: number }> {
        const productos = await Productos.findAll({ attributes: ['id', 'nombre', 'descripcion', 'embedding'] });
        let indexados = 0;
        for (const p of productos) {
            const vec = await this.semanticaService.generateEmbedding(
                this.buildEmbeddingText(p.nombre, p.descripcion),
            );
            if (vec) {
                await p.update({ embedding: JSON.stringify(vec) });
                indexados++;
            }
        }
        return { total: productos.length, indexados };
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
            es_unico: createProductDto.es_unico,
            es_activo: true,
        });

        const fotosConProductoId: CreateProductFotosDto[] = fotos.map((foto) => ({
            url: foto.url,
            id_producto: producto.id,
        }));

        if (fotosConProductoId.length > 0) {
            await this.fotosService.bulkCreate(fotosConProductoId);
        }

        void this.saveEmbedding(producto); // fire-and-forget, no bloquea la respuesta

        return this.findById(producto.id);
    }

    async update(
        id: number,
        updateProductDto: CreateUpdateProductDto,
        fotos: { url: string }[],
        options?: { replaceFotos?: boolean },
    ): Promise<GetProductDto> {
        const producto = await this.findProductoOrThrow(id);

        await producto.update(updateProductDto);

        if (options?.replaceFotos) {
            const fotosConProductoId: CreateProductFotosDto[] = fotos.map((foto) => ({
                url: foto.url,
                id_producto: id,
            }));

            await this.fotosService.replaceProductFotos(id, fotosConProductoId);
        }

        void this.saveEmbedding(producto); // fire-and-forget

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

        return this.mapProductosWithDiscount(productos);
    }

    private async findByFiltersSemantico(
        filters: ProductFiltersDto,
        page: number,
        pageSize: number,
        extraWhere: Record<string, unknown> = {},
        clientIp?: string,
    ): Promise<PaginatedProductsResponseDto<GetProductDto> | null> {
        // Construye el WHERE sin el filtro de nombre (lo maneja semántica)
        const whereClause = { ...this.buildWhereByFilters({ ...filters, nombre: undefined }), ...extraWhere };

        const rows = await Productos.findAll({
            where: whereClause,
            include: PRODUCT_INCLUDE,
            order: await this.buildOrder(),
            attributes: { include: ['embedding'] },
        });

        const ranked = await this.semanticaService.rankBySimilarity(filters.nombre!, rows, clientIp);
        if (ranked === null) return null; // Ollama caído o rate limit → usar fallback

        const totalItems = ranked.length;
        const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
        const offset = (page - 1) * pageSize;
        const pageRows = ranked.slice(offset, offset + pageSize);

        const descuentosAplicados = await this.descuentosService.resolveEffectiveDiscountsForProducts(pageRows);

        return {
            page,
            pageSize,
            totalItems,
            totalPages,
            data: pageRows.map((p) => this.mapProducto(p, undefined, descuentosAplicados.get(p.id))),
        };
    }

    async findByFiltersPaginated(filters: ProductFiltersDto, page?: number, clientIp?: string): Promise<PaginatedProductsResponseDto<GetProductDto>> {
        const normalizedPage = this.normalizePage(page);

        if (filters.nombre) {
            const semantic = await this.findByFiltersSemantico(filters, normalizedPage, 12, { es_activo: true }, clientIp);
            if (semantic) return semantic;
        }

        // Fallback: LIKE normal
        return this.findProductosPaginated({
            where: { ...this.buildWhereByFilters(filters), es_activo: true },
            page: normalizedPage,
            pageSize: 12,
        });
    }

    async findByFiltersForAdminPaginated(
        filters: ProductFiltersDto,
        page?: number,
        pageSize?: number,
    ): Promise<PaginatedProductsResponseDto<GetProductDto>> {
        const normalizedPage = this.normalizePage(page);
        const normalizedPageSize = this.normalizeAdminPageSize(pageSize);

        if (filters.nombre) {
            const semantic = await this.findByFiltersSemantico(filters, normalizedPage, normalizedPageSize);
            if (semantic) return semantic;
        }

        // Fallback: LIKE normal
        return this.findProductosPaginated({
            where: this.buildWhereByFilters(filters),
            page: normalizedPage,
            pageSize: normalizedPageSize,
        });
    }

    async reindexar(): Promise<{ total: number; indexados: number }> {
        return this.reindexarTodos();
    }
}
