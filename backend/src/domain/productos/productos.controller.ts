import { BadRequestException, Controller, Get, Post, Req, Res, Param, Query, Put, Delete, UseGuards } from '@nestjs/common';
import { ApiBody, ApiConsumes, ApiTags, ApiCreatedResponse, ApiOkResponse, ApiParam, ApiQuery, ApiCookieAuth, ApiOperation } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { promises as fs } from 'fs';
import path from 'path';
import SftpSingleton from 'src/utils/sftp/sftp_instance';
import { upload } from 'src/utils/sftp/upload';
import { ProductosService, OrdenConfigItemDto } from './productos.service';
import { FotosService } from 'src/domain/fotos/fotos.service';
import { DisenosService } from 'src/domain/disenos/disenos.service';
import { GetProductDto, SuccessDeleteProductDto, CreateUpdateProductDto, ProductFiltersDto, PaginatedProductsResponseDto, PaginatedProductsListResponseDto } from './DTOs/products.dto';
import { CreateProductFotosDto } from 'src/domain/fotos/DTOs/fotos.dto';
import { AuthGuard } from 'src/auth/utils/auth.guard';
import { Role1Guard } from 'src/auth/utils/role1.guard';

const REMOTE_PRODUCTS_BASE_PATH = '/var/www/tribal_trend/files/products';
const PUBLIC_PRODUCTS_PATH = '/products';
const PUBLIC_BASE_URL = 'https://tribaltrend.com.ar';

type ProductPhotoOrderItem =
    | { type: 'existing'; url: string }
    | { type: 'new'; fileIndex: number };

type ProductDesignOrderItem = {
    id?: number;
    nombre: string;
    precio: number;
    stock: number;
    url_foto?: string | null;
    fileIndex?: number;
};

@ApiTags('Productos')
@Controller('productos')
export class ProductosController {
    constructor(
        private readonly productosService: ProductosService,
        private readonly fotosService: FotosService,
        private readonly disenosService: DisenosService,
    ) {}

        @UseGuards(AuthGuard, Role1Guard)
        @ApiCookieAuth('cookieAuth')
        @Get('admin/orden-config')
        @ApiOperation({ summary: 'Obtener configuración de orden por categoría/subcategoría (admin)' })
        async getOrdenConfig(): Promise<OrdenConfigItemDto[]> {
            return this.productosService.getOrdenConfig();
        }

        @UseGuards(AuthGuard, Role1Guard)
        @ApiCookieAuth('cookieAuth')
        @Put('admin/orden-config')
        @ApiOperation({ summary: 'Guardar configuración de orden por categoría/subcategoría (admin)' })
        @ApiBody({
            schema: {
                type: 'array',
                items: {
                    type: 'object',
                    properties: {
                        id_categoria: { type: 'number' },
                        posicion: { type: 'number' },
                        subcategorias: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    id_subcategoria: { type: 'number' },
                                    posicion: { type: 'number' },
                                },
                            },
                        },
                    },
                },
            },
        })
        async setOrdenConfig(@Req() req: Request): Promise<OrdenConfigItemDto[]> {
            const items = req.body as OrdenConfigItemDto[];
            if (!Array.isArray(items)) throw new BadRequestException('Se esperaba un array de categorías');
            return this.productosService.setOrdenConfig(items);
        }

        @Get()
        @ApiQuery({ name: 'page', type: Number, required: false, description: 'Página (1-based)' })
        @ApiOkResponse({ type: PaginatedProductsListResponseDto })
        async findAll(@Query('page') page?: string): Promise<PaginatedProductsResponseDto<GetProductDto>> {
            return this.productosService.findAllPaginated(this.parseOptionalNumber(page));
        }

        @UseGuards(AuthGuard, Role1Guard)
        @ApiCookieAuth('cookieAuth')
        @Get('admin/all')
        @ApiQuery({ name: 'page', type: Number, required: false, description: 'Página (1-based)' })
        @ApiQuery({ name: 'pageSize', type: Number, required: false, description: 'Tamaño de página (10, 15, 20)' })
        @ApiOkResponse({ type: PaginatedProductsListResponseDto })
        async findAllForAdmin(
            @Query('page') page?: string,
            @Query('pageSize') pageSize?: string,
        ): Promise<PaginatedProductsResponseDto<GetProductDto>> {
            return this.productosService.findAllForAdminPaginated(
                this.parseOptionalNumber(page),
                this.parseOptionalNumber(pageSize),
            );
        }

        @Get('filters')
        @ApiQuery({ name: 'name', type: String, required: false, description: 'Término de búsqueda para nombre' })
        @ApiQuery({ name: 'id_categoria', type: Number, required: false, description: 'ID de la categoría para filtrar (opcional)' })
        @ApiQuery({ name: 'id_subcategoria', type: Number, required: false, description: 'ID de la subcategoría para filtrar (opcional)' })
        @ApiQuery({ name: 'precio_min', type: Number, required: false, description: 'Precio mínimo para filtrar (opcional)' })
        @ApiQuery({ name: 'precio_max', type: Number, required: false, description: 'Precio máximo para filtrar (opcional)' })
        @ApiQuery({ name: 'page', type: Number, required: false, description: 'Página (1-based)' })
        @ApiOkResponse({ type: PaginatedProductsListResponseDto })
        async findByFilters(
            @Query('name') name?: string,
            @Query('id_categoria') id_categoria?: string,
            @Query('id_subcategoria') id_subcategoria?: string,
            @Query('precio_min') precio_min?: string,
            @Query('precio_max') precio_max?: string,
            @Query('page') page?: string,
        ): Promise<PaginatedProductsResponseDto<GetProductDto>> {
            const filters: ProductFiltersDto = {
                nombre: this.parseOptionalString(name),
                id_categoria: this.parseOptionalNumber(id_categoria),
                id_subcategoria: this.parseOptionalNumber(id_subcategoria),
                precio_min: this.parseOptionalNumber(precio_min),
                precio_max: this.parseOptionalNumber(precio_max),
            };

            return this.productosService.findByFiltersPaginated(filters, this.parseOptionalNumber(page));
        }

        @UseGuards(AuthGuard, Role1Guard)
        @ApiCookieAuth('cookieAuth')
        @Get('admin/filters')
        @ApiQuery({ name: 'name', type: String, required: false, description: 'Término de búsqueda para nombre' })
        @ApiQuery({ name: 'id_categoria', type: Number, required: false, description: 'ID de la categoría para filtrar (opcional)' })
        @ApiQuery({ name: 'id_subcategoria', type: Number, required: false, description: 'ID de la subcategoría para filtrar (opcional)' })
        @ApiQuery({ name: 'precio_min', type: Number, required: false, description: 'Precio mínimo para filtrar (opcional)' })
        @ApiQuery({ name: 'precio_max', type: Number, required: false, description: 'Precio máximo para filtrar (opcional)' })
        @ApiQuery({ name: 'page', type: Number, required: false, description: 'Página (1-based)' })
        @ApiQuery({ name: 'pageSize', type: Number, required: false, description: 'Tamaño de página (10, 15, 20)' })
        @ApiOkResponse({ type: PaginatedProductsListResponseDto })
        async findByFiltersForAdmin(
            @Query('name') name?: string,
            @Query('id_categoria') id_categoria?: string,
            @Query('id_subcategoria') id_subcategoria?: string,
            @Query('precio_min') precio_min?: string,
            @Query('precio_max') precio_max?: string,
            @Query('page') page?: string,
            @Query('pageSize') pageSize?: string,
        ): Promise<PaginatedProductsResponseDto<GetProductDto>> {
            const filters: ProductFiltersDto = {
                nombre: this.parseOptionalString(name),
                id_categoria: this.parseOptionalNumber(id_categoria),
                id_subcategoria: this.parseOptionalNumber(id_subcategoria),
                precio_min: this.parseOptionalNumber(precio_min),
                precio_max: this.parseOptionalNumber(precio_max),
            };

            return this.productosService.findByFiltersForAdminPaginated(
                filters,
                this.parseOptionalNumber(page),
                this.parseOptionalNumber(pageSize),
            );
        }

        @Get('search')
        @ApiQuery({ name: 'name', type: String, required: false, description: 'Término de búsqueda para nombre o descripción' })
        @ApiQuery({ name: 'id_categoria', type: Number, required: false, description: 'ID de la categoría para filtrar (opcional)' })
        @ApiQuery({ name: 'id_subcategoria', type: Number, required: false, description: 'ID de la subcategoría para filtrar (opcional)' })
        @ApiQuery({ name: 'precio_min', type: Number, required: false, description: 'Precio mínimo para filtrar (opcional)' })
        @ApiQuery({ name: 'precio_max', type: Number, required: false, description: 'Precio máximo para filtrar (opcional)' })
        @ApiOkResponse({ type: GetProductDto, isArray: true })
        async search(
            @Query('name') name?: string,
            @Query('id_categoria') id_categoria?: string,
            @Query('id_subcategoria') id_subcategoria?: string,
            @Query('precio_min') precio_min?: string,
            @Query('precio_max') precio_max?: string,
        ): Promise<GetProductDto[]> {
            return this.productosService.getProductsByCategoryIdOrSubcategoryIdOrName({
                nombre: name,
                id_categoria: this.parseOptionalNumber(id_categoria),
                id_subcategoria: this.parseOptionalNumber(id_subcategoria),
                precio_min: this.parseOptionalNumber(precio_min),
                precio_max: this.parseOptionalNumber(precio_max),
            });
        }

        @Get(':id')
        @ApiParam({ name: 'id', type: Number, description: 'ID del producto a obtener', example: 1 })
        @ApiOkResponse({ type: GetProductDto })
        async findById(@Param('id') id: number): Promise<GetProductDto> {
            return this.productosService.findById(id);
        }

        @UseGuards(AuthGuard, Role1Guard)
        @ApiCookieAuth('cookieAuth')
        @Post()
        @ApiConsumes('multipart/form-data')
        @ApiBody({
            schema: {
                type: 'object',
                required: ['producto', 'file'],
                properties: {
                    producto: {
                        type: 'string',
                        description: 'JSON en texto con los datos del producto (CreateUpdateProductDto)',
                        example:
                            '{"nombre":"Macramé","descripcion":"Descripción del producto","precio":99.99,"stock":10,"id_categoria":1,"id_subcategoria":1,"ancho":1,"alto":1,"profundo":1,"peso_gramos":1,"es_unico":true}',
                    },
                    file: {
                        type: 'array',
                        items: {
                            type: 'string',
                            format: 'binary',
                        },
                        description: 'Una o más imágenes del producto',
                    },
                },
            },
        })
        @ApiCreatedResponse({ type: GetProductDto })
        async create(@Req() req: Request, @Res() res: Response): Promise<void> {
            await this.runMulter(req, res);

            const files = req.files as Express.Multer.File[] | undefined;
            const createProductDto = this.parseCreateProductDto(req.body as Record<string, unknown>);
            const photoOrder = this.parsePhotoOrder(req.body as Record<string, unknown>);
            const designOrder = this.parseDesignOrder(req.body as Record<string, unknown>);

            if (createProductDto.es_unico && (!files || files.length === 0)) {
                throw new BadRequestException('Al menos una imagen es obligatoria');
            }

            if (!createProductDto.es_unico && designOrder.length === 0) {
                throw new BadRequestException('Debe cargar al menos un diseÃ±o');
            }

            if (!createProductDto.es_unico) {
                createProductDto.stock = this.sumDesignStock(designOrder);
            }

            const uploadedRemotePaths: string[] = [];
            const sftp = await SftpSingleton.getInstance();
            let productoCreado: GetProductDto | null = null;

            try {
                productoCreado = await this.productosService.create(createProductDto, []);
                const idProducto = productoCreado.id;
                await this.ensureRemoteProductDirectory(sftp, idProducto);

                const uploadedUrlsByFileIndex = new Map<number, string>();
                for (const [fileIndex, file] of (files ?? []).entries()) {
                    const fileName = this.buildFileName(file.originalname);
                    const remotePath = this.buildRemotePath(idProducto, fileName);

                    try {
                        await sftp.put(file.path, remotePath);
                        uploadedRemotePaths.push(remotePath);
                    } finally {
                        await fs.unlink(file.path).catch(() => undefined);
                    }

                    uploadedUrlsByFileIndex.set(fileIndex, this.buildPublicUrl(idProducto, fileName));
                }

                if (createProductDto.es_unico) {
                    const fotosParaProducto = this.resolveOrderedPhotoUrls(
                        photoOrder,
                        uploadedUrlsByFileIndex,
                        [],
                        files?.length ?? 0,
                    ).map((url) => ({ url }));

                    const fotosConProductoId: CreateProductFotosDto[] = fotosParaProducto.map((foto) => ({
                        id_producto: idProducto,
                        url: foto.url,
                    }));

                    await this.fotosService.bulkCreate(fotosConProductoId);
                    await this.disenosService.syncUniqueDesign(idProducto, {
                        nombre: createProductDto.nombre,
                        precio: createProductDto.precio,
                        stock: createProductDto.stock,
                    });
                } else {
                    for (const design of designOrder) {
                        if (design.fileIndex === undefined) {
                            throw new BadRequestException('Cada diseÃ±o nuevo debe tener una foto');
                        }

                        const uploadedUrl = uploadedUrlsByFileIndex.get(design.fileIndex);
                        if (!uploadedUrl) {
                            throw new BadRequestException('No se encontrÃ³ la foto del diseÃ±o');
                        }

                        await this.disenosService.create(idProducto, {
                            nombre: design.nombre,
                            precio: design.precio,
                            stock: design.stock,
                        }, uploadedUrl);
                    }
                }

                const productoConFotos = await this.productosService.findById(idProducto);
                res.status(201).json(productoConFotos);
            } catch (error) {
                await Promise.all(uploadedRemotePaths.map((remotePath) => sftp.delete(remotePath).catch(() => undefined)));

                if (error instanceof BadRequestException) {
                    throw error;
                }

                throw new BadRequestException('No se pudo crear el producto o subir las imágenes');
            }
        }

        @UseGuards(AuthGuard, Role1Guard)
        @ApiCookieAuth('cookieAuth')
        @Put(':id')
        @ApiConsumes('multipart/form-data')
        @ApiParam({ name: 'id', type: Number, description: 'ID del producto a actualizar', example: 1 })
        @ApiBody({
            schema: {
                type: 'object',
                properties: {
                    producto: {
                    type: 'string',
                    description: 'JSON en texto con los datos del producto (CreateUpdateProductDto)',
                    example:
                        '{"nombre":"Macramé","descripcion":"Descripción del producto","precio":99.99,"stock":10,"id_categoria":1,"id_subcategoria":1,"ancho":1,"alto":1,"profundo":1,"peso_gramos":1,"es_unico":true}',
                    },
                    file: {
                    type: 'array',
                    items: {
                        type: 'string',
                        format: 'binary',
                    },
                    description: 'Una o más imágenes del producto (opcional)',
                    },
                },
            },
        })
        @ApiOkResponse({ type: GetProductDto })
        async update(@Param('id') id: number, @Req() req: Request, @Res() res: Response): Promise<void> {
            await this.runMulter(req, res);

            const idProducto = Number(id);
            if (!Number.isInteger(idProducto) || idProducto <= 0) {
                throw new BadRequestException('ID de producto invÃ¡lido');
            }

            const files = req.files as Express.Multer.File[] | undefined;
            const createProductDto = this.parseCreateProductDto(req.body as Record<string, unknown>);
            const photoOrder = this.parsePhotoOrder(req.body as Record<string, unknown>);
            const designOrder = this.parseDesignOrder(req.body as Record<string, unknown>);
            if (!createProductDto.es_unico) {
                createProductDto.stock = this.sumDesignStock(designOrder);
            }
            const uploadedRemotePaths: string[] = [];
            const sftp = await SftpSingleton.getInstance();

            try {
                const productoActual = await this.productosService.findById(idProducto);
                const orderedExistingUrls = productoActual.fotos.map((foto) => foto.url);
                const uploadedUrlsByFileIndex = new Map<number, string>();

            if (files && files.length > 0) {
                await this.ensureRemoteProductDirectory(sftp, idProducto);
                for (const file of files) {
                const fileIndex = uploadedUrlsByFileIndex.size;
                const fileName = this.buildFileName(file.originalname);
                const remotePath = this.buildRemotePath(idProducto, fileName);

                try {
                    await sftp.put(file.path, remotePath);
                    uploadedRemotePaths.push(remotePath);
                } finally {
                    await fs.unlink(file.path).catch(() => undefined);
                }

                uploadedUrlsByFileIndex.set(fileIndex, this.buildPublicUrl(idProducto, fileName));
                }
            }

            if (createProductDto.es_unico) {
                const orderedPhotoUrls = this.resolveOrderedPhotoUrls(
                    photoOrder,
                    uploadedUrlsByFileIndex,
                    orderedExistingUrls,
                    files?.length ?? 0,
                );

                const removedExistingUrls = orderedExistingUrls.filter((url) => !orderedPhotoUrls.includes(url));
                await this.deleteCurrentRemoteFotos(sftp, removedExistingUrls);

                await this.productosService.update(idProducto, createProductDto, orderedPhotoUrls.map((url) => ({ url })), {
                    replaceFotos: photoOrder.length > 0 || Boolean(files?.length),
                });
                await this.disenosService.syncUniqueDesign(idProducto, {
                    nombre: createProductDto.nombre,
                    precio: createProductDto.precio,
                    stock: createProductDto.stock,
                });
            } else {
                if (designOrder.length === 0) {
                    throw new BadRequestException('Debe cargar al menos un diseÃ±o');
                }

                const existingDesigns = await this.disenosService.findByProducto(idProducto);
                const sentDesignIds = new Set<number>();

                for (const design of designOrder) {
                    const uploadedUrl = design.fileIndex === undefined
                        ? undefined
                        : uploadedUrlsByFileIndex.get(design.fileIndex);

                    if (design.fileIndex !== undefined && !uploadedUrl) {
                        throw new BadRequestException('No se encontrÃ³ la foto del diseÃ±o');
                    }

                    if (design.id) {
                        const previousDiseno = await this.disenosService.findById(design.id);
                        if (previousDiseno.id_producto !== idProducto) {
                            throw new BadRequestException('El diseÃ±o no pertenece al producto');
                        }

                        await this.disenosService.update(design.id, {
                            nombre: design.nombre,
                            precio: design.precio,
                            stock: design.stock,
                        }, uploadedUrl);

                        if (uploadedUrl && previousDiseno.url_foto) {
                            await this.deleteCurrentRemoteFotos(sftp, [previousDiseno.url_foto]);
                        }

                        sentDesignIds.add(design.id);
                        continue;
                    }

                    if (!uploadedUrl && !design.url_foto) {
                        throw new BadRequestException('Cada diseÃ±o nuevo debe tener una foto');
                    }

                    const created = await this.disenosService.create(idProducto, {
                        nombre: design.nombre,
                        precio: design.precio,
                        stock: design.stock,
                    }, uploadedUrl ?? design.url_foto ?? null, {
                        syncFoto: Boolean(uploadedUrl),
                    });
                    sentDesignIds.add(created.id);
                }

                for (const diseno of existingDesigns) {
                    if (!sentDesignIds.has(diseno.id)) {
                        const deleted = await this.disenosService.delete(diseno.id);
                        if (deleted.url_foto) {
                            await this.deleteCurrentRemoteFotos(sftp, [deleted.url_foto]);
                        }
                    }
                }

                const finalDesigns = await this.disenosService.findByProducto(idProducto);
                const finalDesignUrls = finalDesigns
                    .map((diseno) => diseno.url_foto)
                    .filter((url): url is string => Boolean(url));
                const removedExistingUrls = orderedExistingUrls.filter((url) => !finalDesignUrls.includes(url));
                await this.deleteCurrentRemoteFotos(sftp, removedExistingUrls);
                await this.productosService.update(idProducto, createProductDto, finalDesignUrls.map((url) => ({ url })), {
                    replaceFotos: true,
                });
            }

            const productoActualizado = await this.productosService.findById(idProducto);
            res.status(200).json(productoActualizado);
            } catch (error) {
            await Promise.all(uploadedRemotePaths.map((remotePath) => sftp.delete(remotePath).catch(() => undefined)));

            if (error instanceof BadRequestException) {
                throw error;
            }

            throw new BadRequestException('No se pudo actualizar el producto o subir las imágenes');
            }
        }
        
        @UseGuards(AuthGuard, Role1Guard)
        @ApiCookieAuth('cookieAuth')
        @Put('toggle/:id')
        @ApiParam({ name: 'id', type: Number, description: 'ID del producto a activar/desactivar', example: 1 })
        @ApiOkResponse({ type: GetProductDto })
        async toggle(@Param('id') id: number): Promise<GetProductDto> {
            return this.productosService.toggleActivateProducto(id);
        }

        @UseGuards(AuthGuard, Role1Guard)
        @ApiCookieAuth('cookieAuth')
        @Delete(':id')
        @ApiOkResponse({ type: SuccessDeleteProductDto })
        @ApiParam({ name: 'id', type: Number, description: 'ID del producto a eliminar', example: 1 })
        async delete(@Param('id') id: number): Promise<SuccessDeleteProductDto> {
            return this.productosService.deleteProducto(id);
        }

        private parseCreateProductDto(body: Record<string, unknown>): CreateUpdateProductDto {
            const payload = this.extractProductPayload(body);
            const data = this.parsePayloadToObject(payload);

            return {
                nombre: this.requireString(data, 'nombre'),
                descripcion: this.requireString(data, 'descripcion'),
                precio: this.requireNumber(data, 'precio'),
                stock: this.requireNumber(data, 'stock'),
                id_categoria: this.requireNumber(data, 'id_categoria'),
                id_subcategoria: this.requireNumber(data, 'id_subcategoria'),
                ancho: this.requireNumber(data, 'ancho'),
                alto: this.requireNumber(data, 'alto'),
                profundo: this.requireNumber(data, 'profundo'),
                peso_gramos: this.requireNumber(data, 'peso_gramos'),
                es_unico: this.parseOptionalBoolean(data, 'es_unico', true),
            };
        }

        private parsePhotoOrder(body: Record<string, unknown>): ProductPhotoOrderItem[] {
            const raw = body.fotos_ordenadas ?? body.photoOrder;
            if (raw === undefined || raw === null || raw === '') {
                return [];
            }

            let parsed: unknown;
            if (typeof raw === 'string') {
                try {
                    parsed = JSON.parse(raw);
                } catch {
                    throw new BadRequestException('El orden de fotos es inválido');
                }
            } else {
                parsed = raw;
            }

            if (!Array.isArray(parsed)) {
                throw new BadRequestException('El orden de fotos debe ser un array');
            }

            return parsed.map((item) => {
                if (!item || typeof item !== 'object') {
                    throw new BadRequestException('Item de foto inválido');
                }

                const data = item as Record<string, unknown>;
                if (data.type === 'existing' && typeof data.url === 'string' && data.url.trim()) {
                    return { type: 'existing', url: data.url.trim() };
                }

                if (data.type === 'new' && Number.isInteger(Number(data.fileIndex))) {
                    return { type: 'new', fileIndex: Number(data.fileIndex) };
                }

                throw new BadRequestException('Item de foto inválido');
            });
        }

        private parseDesignOrder(body: Record<string, unknown>): ProductDesignOrderItem[] {
            const raw = body.disenos_ordenados ?? body.designOrder;
            if (raw === undefined || raw === null || raw === '') {
                return [];
            }

            let parsed: unknown;
            if (typeof raw === 'string') {
                try {
                    parsed = JSON.parse(raw);
                } catch {
                    throw new BadRequestException('El orden de diseÃ±os es invÃ¡lido');
                }
            } else {
                parsed = raw;
            }

            if (!Array.isArray(parsed)) {
                throw new BadRequestException('El orden de diseÃ±os debe ser un array');
            }

            return parsed.map((item) => {
                if (!item || typeof item !== 'object') {
                    throw new BadRequestException('Item de diseÃ±o invÃ¡lido');
                }

                const data = item as Record<string, unknown>;
                const nombre = typeof data.nombre === 'string' ? data.nombre.trim() : '';
                const precio = Number(data.precio);
                const stock = Number(data.stock);
                const id = data.id === undefined || data.id === null || data.id === ''
                    ? undefined
                    : Number(data.id);
                const fileIndex = data.fileIndex === undefined || data.fileIndex === null || data.fileIndex === ''
                    ? undefined
                    : Number(data.fileIndex);
                const urlFoto = typeof data.url_foto === 'string' && data.url_foto.trim()
                    ? data.url_foto.trim()
                    : null;

                if (!nombre) {
                    throw new BadRequestException('El nombre del diseÃ±o es obligatorio');
                }

                if (!Number.isFinite(precio) || precio <= 0) {
                    throw new BadRequestException('El precio del diseÃ±o debe ser mayor a 0');
                }

                if (!Number.isFinite(stock) || stock < 0) {
                    throw new BadRequestException('El stock del diseÃ±o no puede ser negativo');
                }

                if (id !== undefined && (!Number.isInteger(id) || id <= 0)) {
                    throw new BadRequestException('ID de diseÃ±o invÃ¡lido');
                }

                if (fileIndex !== undefined && (!Number.isInteger(fileIndex) || fileIndex < 0)) {
                    throw new BadRequestException('Indice de archivo de diseÃ±o invÃ¡lido');
                }

                return {
                    id,
                    nombre,
                    precio,
                    stock: Math.floor(stock),
                    url_foto: urlFoto,
                    fileIndex,
                };
            });
        }

        private sumDesignStock(designOrder: ProductDesignOrderItem[]): number {
            return designOrder.reduce((total, design) => total + Math.max(0, Math.floor(Number(design.stock))), 0);
        }

        private resolveOrderedPhotoUrls(
            photoOrder: ProductPhotoOrderItem[],
            uploadedUrlsByFileIndex: Map<number, string>,
            fallbackExistingUrls: string[],
            totalFiles: number,
        ): string[] {
            if (!photoOrder.length) {
                return [
                    ...fallbackExistingUrls,
                    ...Array.from({ length: totalFiles }, (_, fileIndex) => uploadedUrlsByFileIndex.get(fileIndex))
                        .filter((url): url is string => Boolean(url)),
                ];
            }

            const result = photoOrder.map((item) => {
                if (item.type === 'existing') {
                    return item.url;
                }

                const uploadedUrl = uploadedUrlsByFileIndex.get(item.fileIndex);
                if (!uploadedUrl) {
                    throw new BadRequestException('No se encontró una foto nueva del orden enviado');
                }
                return uploadedUrl;
            });

            if (!result.length) {
                throw new BadRequestException('El producto debe tener al menos una foto');
            }

            return result;
        }

        private extractProductPayload(body: Record<string, unknown>): unknown {
            const knownKeys = ['producto', 'data', 'payload', 'body'];
            for (const key of knownKeys) {
                if (body[key] !== undefined) {
                    return body[key];
                }
            }

            const firstJsonString = Object.values(body).find(
                (value) => typeof value === 'string' && value.trim().startsWith('{') && value.trim().endsWith('}'),
            );

            return firstJsonString ?? body;
        }

        private parsePayloadToObject(payload: unknown): Record<string, unknown> {
            if (typeof payload === 'string') {
                try {
                    const parsed = JSON.parse(payload) as unknown;
                    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
                        return parsed as Record<string, unknown>;
                    }
                } catch {
                    throw new BadRequestException('El JSON del producto es inválido');
                }
                throw new BadRequestException('El JSON del producto es inválido');
            }

            if (payload && typeof payload === 'object' && !Array.isArray(payload)) {
                return payload as Record<string, unknown>;
            }

            throw new BadRequestException('Los datos del producto son obligatorios');
        }

        private requireString(data: Record<string, unknown>, key: string): string {
            const value = data[key];
            if (typeof value !== 'string' || value.trim().length === 0) {
                throw new BadRequestException(`Campo obligatorio inválido: ${key}`);
            }
            return value;
        }

        private requireNumber(data: Record<string, unknown>, key: string): number {
            const value = Number(data[key]);
            if (!Number.isFinite(value)) {
                throw new BadRequestException(`Campo numérico inválido: ${key}`);
            }
            return value;
        }

        private parseOptionalBoolean(data: Record<string, unknown>, key: string, fallback: boolean): boolean {
            const value = data[key];
            if (value === undefined || value === null || value === '') {
                return fallback;
            }
            if (typeof value === 'boolean') {
                return value;
            }
            if (typeof value === 'string') {
                const normalized = value.trim().toLowerCase();
                if (['true', '1', 'si', 'sí'].includes(normalized)) {
                    return true;
                }
                if (['false', '0', 'no'].includes(normalized)) {
                    return false;
                }
            }
            if (typeof value === 'number' && [0, 1].includes(value)) {
                return Boolean(value);
            }

            throw new BadRequestException(`Campo booleano inválido: ${key}`);
        }

        private parseOptionalNumber(value?: string): number | undefined {
            if (value === undefined || value === null || value === '') {
                return undefined;
            }

            const parsed = Number(value);
            if (!Number.isFinite(parsed)) {
                throw new BadRequestException(`Valor numérico inválido en filtro: ${value}`);
            }

            return parsed;
        }

        private parseOptionalString(value?: string): string | undefined {
            if (value === undefined || value === null) {
                return undefined;
            }

            const trimmed = value.trim();
            return trimmed.length ? trimmed : undefined;
        }

        private runMulter(req: Request, res: Response): Promise<void> {
            return new Promise((resolve, reject) => {
                upload.array('file', 10)(req, res, (error: unknown) => {
                    if (error) {
                        reject(new BadRequestException('Error al procesar el archivo'));
                        return;
                    }

                    resolve();
                });
            });
        }

        private buildFileName(originalName: string): string {
            const extension = path.extname(originalName);
            const baseName = path.basename(originalName, extension);
            const safeBase = baseName.replace(/[^a-zA-Z0-9-_]/g, '_');
            const suffix = Math.random().toString(36).slice(2, 10);
            return `${Date.now()}_${safeBase || 'file'}_${suffix}${extension}`;
        }

        private async ensureRemoteProductDirectory(sftp: { exists: (path: string) => Promise<unknown>; mkdir: (path: string, recursive: boolean) => Promise<unknown> }, idProducto: number): Promise<void> {
            const directoryPath = `${REMOTE_PRODUCTS_BASE_PATH}/${idProducto}`;
            const directoryExists = await sftp.exists(directoryPath);

            if (!directoryExists) {
                await sftp.mkdir(directoryPath, true);
            }
        }

        private buildRemotePath(idProducto: number, fileName: string): string {
            return `${REMOTE_PRODUCTS_BASE_PATH}/${idProducto}/${fileName}`;
        }

        private buildPublicUrl(idProducto: number, fileName: string): string {
            return `${PUBLIC_BASE_URL}/files/${PUBLIC_PRODUCTS_PATH}/${idProducto}/${fileName}`;
        }

        private async deleteCurrentRemoteFotos(sftp: { delete: (path: string) => Promise<unknown> }, fotoUrls: string[]): Promise<void> {
            const remotePaths = fotoUrls
                .map((url) => this.mapPublicUrlToRemotePath(url))
                .filter((remotePath): remotePath is string => Boolean(remotePath));

            await Promise.all(remotePaths.map((remotePath) => sftp.delete(remotePath).catch(() => undefined)));
        }

        private mapPublicUrlToRemotePath(fotoUrl: string): string | null {
            try {
                const pathname = new URL(fotoUrl).pathname;
                const expectedPrefix = `/files${PUBLIC_PRODUCTS_PATH}/`;

                if (!pathname.startsWith(expectedPrefix)) {
                    return null;
                }

                const relativePath = pathname.slice(expectedPrefix.length);
                return `${REMOTE_PRODUCTS_BASE_PATH}/${relativePath}`;
            } catch {
                return null;
            }
        }   
}

