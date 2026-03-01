import { BadRequestException, Controller, Get, Post, Req, Res, Param, Query, Put, Delete, UseGuards } from '@nestjs/common';
import { ApiBody, ApiConsumes, ApiTags, ApiOkResponse, ApiParam, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { promises as fs } from 'fs';
import path from 'path';
import SftpSingleton from '../utils/sftp/sftp_instance';
import { upload } from '../utils/sftp/upload';
import { ProductosService } from './productos.service';
import { FotosService } from 'src/fotos/fotos.service';
import { GetProductDto, SuccessDeleteProductDto, CreateUpdateProductDto, ProductFiltersDto, PaginatedProductsResponseDto } from './DTOs/products.dto';
import { CreateProductFotosDto } from 'src/fotos/DTOs/fotos.dto';
import { AuthGuard } from 'src/auth/utils/auth.guard';
import { Role1Guard } from 'src/auth/utils/role1.guard';

const REMOTE_PRODUCTS_BASE_PATH = '/var/www/tribal_trend/files/products';
const PUBLIC_PRODUCTS_PATH = '/products';
const PUBLIC_BASE_URL = 'https://tribaltrend.com.ar';

@ApiTags('Productos')
@Controller('productos')
export class ProductosController {
    constructor(
        private readonly productosService: ProductosService,
        private readonly fotosService: FotosService,
    ) {}
       
        @Get()
        @ApiOkResponse({ type: Object })
        async findAll(@Query('page') page?: string): Promise<PaginatedProductsResponseDto<GetProductDto>> {
            return this.productosService.findAllPaginated(this.parseOptionalNumber(page));
        }

        @UseGuards(AuthGuard, Role1Guard)
        @ApiBearerAuth('bearer')
        @Get('admin/all')
        @ApiOkResponse({ type: Object })
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
        @ApiOkResponse({ type: Object })
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
        @ApiBearerAuth('bearer')
        @Get('admin/filters')
        @ApiQuery({ name: 'name', type: String, required: false, description: 'Término de búsqueda para nombre' })
        @ApiQuery({ name: 'id_categoria', type: Number, required: false, description: 'ID de la categoría para filtrar (opcional)' })
        @ApiQuery({ name: 'id_subcategoria', type: Number, required: false, description: 'ID de la subcategoría para filtrar (opcional)' })
        @ApiQuery({ name: 'precio_min', type: Number, required: false, description: 'Precio mínimo para filtrar (opcional)' })
        @ApiQuery({ name: 'precio_max', type: Number, required: false, description: 'Precio máximo para filtrar (opcional)' })
        @ApiQuery({ name: 'page', type: Number, required: false, description: 'Página (1-based)' })
        @ApiQuery({ name: 'pageSize', type: Number, required: false, description: 'Tamaño de página (10, 15, 20)' })
        @ApiOkResponse({ type: Object })
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
        @ApiBearerAuth('bearer')
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
                            '{"nombre":"Macramé","descripcion":"Descripción del producto","precio":99.99,"stock":10,"id_categoria":1,"id_subcategoria":1,"ancho":1,"alto":1,"profundo":1,"peso_gramos":1}',
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
        @ApiOkResponse({ type: GetProductDto })
        async create(@Req() req: Request, @Res() res: Response): Promise<void> {
            await this.runMulter(req, res);

            const files = req.files as Express.Multer.File[] | undefined;
            if (!files || files.length === 0) {
                throw new BadRequestException('Al menos una imagen es obligatoria');
            }

            const createProductDto = this.parseCreateProductDto(req.body as Record<string, unknown>);
            const fotosParaProducto: { url: string }[] = [];
            const uploadedRemotePaths: string[] = [];
            const sftp = await SftpSingleton.getInstance();
            let productoCreado: GetProductDto | null = null;

            try {
                productoCreado = await this.productosService.create(createProductDto, []);
                const idProducto = productoCreado.id;
                await this.ensureRemoteProductDirectory(sftp, idProducto);

                for (const file of files) {
                    const fileName = this.buildFileName(file.originalname);
                    const remotePath = this.buildRemotePath(idProducto, fileName);

                    try {
                        await sftp.put(file.path, remotePath);
                        uploadedRemotePaths.push(remotePath);
                    } finally {
                        await fs.unlink(file.path).catch(() => undefined);
                    }

                    fotosParaProducto.push({
                        url: this.buildPublicUrl(idProducto, fileName),
                    });
                }

                const fotosConProductoId: CreateProductFotosDto[] = fotosParaProducto.map((foto) => ({
                    id_producto: idProducto,
                    url: foto.url,
                }));

                await this.fotosService.bulkCreate(fotosConProductoId);

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
        @ApiBearerAuth('bearer')
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
                        '{"nombre":"Macramé","descripcion":"Descripción del producto","precio":99.99,"stock":10,"id_categoria":1,"id_subcategoria":1,"ancho":1,"alto":1,"profundo":1,"peso_gramos":1}',
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

            const files = req.files as Express.Multer.File[] | undefined;
            const createProductDto = this.parseCreateProductDto(req.body as Record<string, unknown>);
            const fotosParaProducto: { url: string }[] = [];
            const uploadedRemotePaths: string[] = [];
            const sftp = await SftpSingleton.getInstance();

            try {
            if (files && files.length > 0) {
                const productoActual = await this.productosService.findById(id);
                await this.deleteCurrentRemoteFotos(sftp, productoActual.fotos.map((foto) => foto.url));
                await this.ensureRemoteProductDirectory(sftp, id);

                for (const file of files) {
                const fileName = this.buildFileName(file.originalname);
                const remotePath = this.buildRemotePath(id, fileName);

                try {
                    await sftp.put(file.path, remotePath);
                    uploadedRemotePaths.push(remotePath);
                } finally {
                    await fs.unlink(file.path).catch(() => undefined);
                }

                fotosParaProducto.push({
                    url: this.buildPublicUrl(id, fileName),
                });
                }
            }

            const productoActualizado = await this.productosService.update(id, createProductDto, fotosParaProducto);
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
        @ApiBearerAuth('bearer')
        @Put('toggle/:id')
        @ApiParam({ name: 'id', type: Number, description: 'ID del producto a activar/desactivar', example: 1 })
        @ApiOkResponse({ type: GetProductDto })
        async toggle(@Param('id') id: number): Promise<GetProductDto> {
            return this.productosService.toggleActivateProducto(id);
        }

        @UseGuards(AuthGuard, Role1Guard)
        @ApiBearerAuth('bearer')
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
            };
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
                const expectedPrefix = `${PUBLIC_PRODUCTS_PATH}/`;

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