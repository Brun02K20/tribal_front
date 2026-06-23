import {
    Controller, Get, Post, Put, Delete, Param, Req, Res,
    UseGuards, BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody, ApiCookieAuth, ApiParam } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { promises as fs } from 'fs';
import SftpSingleton from 'src/utils/sftp/sftp_instance';
import { upload } from 'src/utils/sftp/upload';
import { AuthGuard } from 'src/auth/utils/auth.guard';
import { Role1Guard } from 'src/auth/utils/role1.guard';
import { BlogsService } from './blogs.service';
import { GetBlogDto, GetBlogListItemDto } from './DTOs/blogs.dto';

const REMOTE_BLOGS_BASE_PATH = '/var/www/tribal_trend/files/blogs';
const PUBLIC_BASE_URL = 'https://tribaltrend.com.ar';

@ApiTags('Blogs')
@Controller('blogs')
export class BlogsController {
    constructor(private readonly blogsService: BlogsService) {}

    // ========== ADMIN (rutas específicas PRIMERO) ==========

    @UseGuards(AuthGuard, Role1Guard)
    @ApiCookieAuth('cookieAuth')
    @Get('admin/all')
    @ApiOperation({ summary: 'Listar todos los artículos (admin)' })
    async findAllForAdmin(): Promise<GetBlogListItemDto[]> {
        return this.blogsService.findAllForAdmin();
    }

    @UseGuards(AuthGuard, Role1Guard)
    @ApiCookieAuth('cookieAuth')
    @Post()
    @ApiConsumes('multipart/form-data')
    @ApiOperation({ summary: 'Crear artículo con imágenes (admin)' })
    @ApiBody({
        schema: {
            type: 'object',
            required: ['blog'],
            properties: {
                blog: {
                    type: 'string',
                    description: 'JSON con titulo y cuerpo',
                    example: '{"titulo":"Mi artículo","cuerpo":"<p>Contenido...</p>"}',
                },
                file: {
                    type: 'array',
                    items: { type: 'string', format: 'binary' },
                    description: 'Imágenes del artículo (opcional)',
                },
            },
        },
    })
    async create(@Req() req: Request, @Res() res: Response): Promise<void> {
        try {
            console.log('[BlogsController] create: inicio');
            await this.runMulter(req, res);
            console.log('[BlogsController] create: multer OK, body keys:', Object.keys(req.body ?? {}));

            const dto = this.parseBlogDto(req.body as Record<string, unknown>);
            console.log('[BlogsController] create: dto parsed:', dto.titulo);

            const files = req.files as Express.Multer.File[] | undefined;
            console.log('[BlogsController] create: files count:', files?.length ?? 0);

            const fotoUrls: string[] = [];
            let blogCreado = await this.blogsService.create(dto, []);
            console.log('[BlogsController] create: blog creado id:', blogCreado.id);

            if (files && files.length > 0) {
                const sftp = await SftpSingleton.getInstance();
                await this.ensureRemoteDirectory(sftp, blogCreado.id);

                for (const file of files) {
                    const fileName = this.buildFileName(file.originalname);
                    const remotePath = `${REMOTE_BLOGS_BASE_PATH}/${blogCreado.id}/${fileName}`;
                    try {
                        await sftp.put(file.path, remotePath);
                    } finally {
                        await fs.unlink(file.path).catch(() => undefined);
                    }
                    fotoUrls.push(`${PUBLIC_BASE_URL}/files/blogs/${blogCreado.id}/${fileName}`);
                }

                blogCreado = await this.blogsService.update(blogCreado.id, dto, fotoUrls);
            }

            console.log('[BlogsController] create: completado, id:', blogCreado.id);
            res.status(201).json(blogCreado);
        } catch (error) {
            console.error('[BlogsController] create ERROR:', error);
            throw error;
        }
    }

    @UseGuards(AuthGuard, Role1Guard)
    @ApiCookieAuth('cookieAuth')
    @Put('toggle/:id')
    @ApiOperation({ summary: 'Activar/desactivar artículo (admin)' })
    @ApiParam({ name: 'id', type: Number })
    async toggle(@Param('id') id: string): Promise<GetBlogDto> {
        return this.blogsService.toggle(Number(id));
    }

    @UseGuards(AuthGuard, Role1Guard)
    @ApiCookieAuth('cookieAuth')
    @Put(':id')
    @ApiConsumes('multipart/form-data')
    @ApiOperation({ summary: 'Editar artículo (admin)' })
    @ApiParam({ name: 'id', type: Number })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                blog: {
                    type: 'string',
                    description: 'JSON con titulo y cuerpo',
                },
                file: {
                    type: 'array',
                    items: { type: 'string', format: 'binary' },
                    description: 'Nuevas imágenes (se agregan, no reemplazan)',
                },
            },
        },
    })
    async update(@Param('id') id: string, @Req() req: Request, @Res() res: Response): Promise<void> {
        try {
            console.log('[BlogsController] update: inicio, id:', id);
            await this.runMulter(req, res);

            const body = req.body as Record<string, unknown>;
            const dto = this.parseBlogDto(body);
            const files = req.files as Express.Multer.File[] | undefined;
            const photoOrder = this.parsePhotoOrder(body);

            const uploadedUrlsByFileIndex = new Map<number, string>();

            if (files && files.length > 0) {
                const sftp = await SftpSingleton.getInstance();
                await this.ensureRemoteDirectory(sftp, Number(id));

                for (let i = 0; i < files.length; i++) {
                    const file = files[i];
                    const fileName = this.buildFileName(file.originalname);
                    const remotePath = `${REMOTE_BLOGS_BASE_PATH}/${id}/${fileName}`;
                    try {
                        await sftp.put(file.path, remotePath);
                    } finally {
                        await fs.unlink(file.path).catch(() => undefined);
                    }
                    uploadedUrlsByFileIndex.set(i, `${PUBLIC_BASE_URL}/files/blogs/${id}/${fileName}`);
                }
            }

            let orderedFotoUrls: string[] | undefined;
            let newFotoUrls: string[] | undefined;

            if (photoOrder.length > 0) {
                orderedFotoUrls = photoOrder.map((item) => {
                    if (item.type === 'existing') return item.url;
                    const url = uploadedUrlsByFileIndex.get(item.fileIndex);
                    if (!url) throw new BadRequestException('No se encontró una foto nueva del orden enviado');
                    return url;
                });
            } else if (uploadedUrlsByFileIndex.size > 0) {
                newFotoUrls = Array.from(uploadedUrlsByFileIndex.values());
            }

            const updated = await this.blogsService.update(Number(id), dto, newFotoUrls, orderedFotoUrls);

            console.log('[BlogsController] update: completado, id:', id);
            res.status(200).json(updated);
        } catch (error) {
            console.error('[BlogsController] update ERROR:', error);
            throw error;
        }
    }

    @UseGuards(AuthGuard, Role1Guard)
    @ApiCookieAuth('cookieAuth')
    @Delete(':id')
    @ApiOperation({ summary: 'Eliminar artículo (admin)' })
    @ApiParam({ name: 'id', type: Number })
    async delete(@Param('id') id: string): Promise<{ ok: true }> {
        await this.blogsService.delete(Number(id));
        return { ok: true };
    }

    // ========== PÚBLICO (rutas genéricas AL FINAL) ==========

    @Get()
    @ApiOperation({ summary: 'Listar artículos publicados (público)' })
    async findAll(): Promise<GetBlogListItemDto[]> {
        return this.blogsService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Ver un artículo (público)' })
    @ApiParam({ name: 'id', type: Number })
    async findById(@Param('id') id: string): Promise<GetBlogDto> {
        return this.blogsService.findById(Number(id));
    }

    // ========== Helpers privados ==========

    private parsePhotoOrder(body: Record<string, unknown>): Array<{ type: 'existing'; url: string } | { type: 'new'; fileIndex: number }> {
        const raw = body['fotos_ordenadas'];
        if (raw === undefined || raw === null || raw === '') return [];

        let parsed: unknown;
        if (typeof raw === 'string') {
            try { parsed = JSON.parse(raw); } catch { throw new BadRequestException('fotos_ordenadas inválido'); }
        } else {
            parsed = raw;
        }

        if (!Array.isArray(parsed)) throw new BadRequestException('fotos_ordenadas debe ser un array');

        return parsed.map((item: unknown) => {
            if (!item || typeof item !== 'object') throw new BadRequestException('Item de foto inválido');
            const data = item as Record<string, unknown>;
            if (data['type'] === 'existing' && typeof data['url'] === 'string' && data['url'].trim()) {
                return { type: 'existing' as const, url: (data['url'] as string).trim() };
            }
            if (data['type'] === 'new' && Number.isInteger(Number(data['fileIndex']))) {
                return { type: 'new' as const, fileIndex: Number(data['fileIndex']) };
            }
            throw new BadRequestException('Item de foto inválido');
        });
    }

    private parseBlogDto(body: Record<string, unknown>) {
        const raw = body['blog'];
        if (!raw || typeof raw !== 'string') {
            throw new BadRequestException('Campo "blog" es obligatorio (JSON string)');
        }
        try {
            const parsed = JSON.parse(raw);
            if (!parsed.titulo?.trim() || !parsed.cuerpo?.trim()) {
                throw new Error();
            }
            return { titulo: parsed.titulo.trim(), cuerpo: parsed.cuerpo.trim() };
        } catch {
            throw new BadRequestException('Campo "blog" debe ser un JSON válido con titulo y cuerpo');
        }
    }

    private buildFileName(originalName: string): string {
        const ext = originalName.split('.').pop() ?? 'jpg';
        return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    }

    private async ensureRemoteDirectory(sftp: any, blogId: number): Promise<void> {
        const remotePath = `${REMOTE_BLOGS_BASE_PATH}/${blogId}`;
        try {
            await sftp.mkdir(remotePath, true);
        } catch {
            // directory may already exist
        }
    }

    private runMulter(req: Request, res: Response): Promise<void> {
        return new Promise((resolve, reject) => {
            upload.array('file', 10)(req, res, (err) => {
                if (err) reject(new BadRequestException(`Error al procesar archivos: ${err.message}`));
                else resolve();
            });
        });
    }
}