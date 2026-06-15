import { BadRequestException, Controller, Delete, Get, Param, Post, Put, Req, Res, UseGuards } from '@nestjs/common';
import { ApiBody, ApiConsumes, ApiCookieAuth, ApiOkResponse, ApiParam, ApiTags } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { promises as fs } from 'fs';
import path from 'path';
import { AuthGuard } from 'src/auth/utils/auth.guard';
import { Role1Guard } from 'src/auth/utils/role1.guard';
import SftpSingleton from 'src/utils/sftp/sftp_instance';
import { upload } from 'src/utils/sftp/upload';
import { GetDisenoDto } from './DTOs/disenos.dto';
import { DisenosService } from './disenos.service';

const REMOTE_PRODUCTS_BASE_PATH = '/var/www/tribal_trend/files/products';
const PUBLIC_PRODUCTS_PATH = '/products';
const PUBLIC_BASE_URL = 'https://tribaltrend.com.ar';

@ApiTags('Diseños')
@Controller('disenos')
@UseGuards(AuthGuard, Role1Guard)
@ApiCookieAuth('cookieAuth')
export class DisenosController {
    constructor(private readonly disenosService: DisenosService) {}

    @Get('producto/:idProducto')
    @ApiParam({ name: 'idProducto', type: Number })
    @ApiOkResponse({ type: GetDisenoDto, isArray: true })
    async findByProducto(@Param('idProducto') idProducto: string): Promise<GetDisenoDto[]> {
        return this.disenosService.findByProducto(Number(idProducto));
    }

    @Post('producto/:idProducto')
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            required: ['diseno', 'file'],
            properties: {
                diseno: {
                    type: 'string',
                    example: '{"nombre":"Diseño mandala azul","precio":12500}',
                },
                file: { type: 'string', format: 'binary' },
            },
        },
    })
    async create(@Param('idProducto') idProducto: string, @Req() req: Request, @Res() res: Response): Promise<void> {
        await this.runMulter(req, res);
        const file = req.file as Express.Multer.File | undefined;
        if (!file) {
            throw new BadRequestException('La foto del diseño es obligatoria');
        }

        const data = this.disenosService.parsePayload(req.body as Record<string, unknown>);
        const idProductoNumber = Number(idProducto);
        const sftp = await SftpSingleton.getInstance();
        const fileName = this.buildFileName(file.originalname);
        const remotePath = this.buildRemotePath(idProductoNumber, fileName);

        try {
            await this.ensureRemoteProductDirectory(sftp, idProductoNumber);
            await sftp.put(file.path, remotePath);
        } finally {
            await fs.unlink(file.path).catch(() => undefined);
        }

        try {
            const diseno = await this.disenosService.create(idProductoNumber, data, this.buildPublicUrl(idProductoNumber, fileName));
            res.status(201).json(diseno);
        } catch (error) {
            await sftp.delete(remotePath).catch(() => undefined);
            throw error;
        }
    }

    @Put(':id')
    @ApiConsumes('multipart/form-data')
    async update(@Param('id') id: string, @Req() req: Request, @Res() res: Response): Promise<void> {
        await this.runMulter(req, res);
        const file = req.file as Express.Multer.File | undefined;
        const data = this.disenosService.parsePayload(req.body as Record<string, unknown>);

        let publicUrl: string | undefined;
        let remotePath: string | undefined;
        const sftp = await SftpSingleton.getInstance();

        if (file) {
            const idProducto = Number((req.body as Record<string, unknown>).id_producto ?? 0);
            if (!idProducto) {
                throw new BadRequestException('id_producto es obligatorio al reemplazar la foto');
            }

            const fileName = this.buildFileName(file.originalname);
            remotePath = this.buildRemotePath(idProducto, fileName);
            publicUrl = this.buildPublicUrl(idProducto, fileName);

            try {
                await this.ensureRemoteProductDirectory(sftp, idProducto);
                await sftp.put(file.path, remotePath);
            } finally {
                await fs.unlink(file.path).catch(() => undefined);
            }
        }

        const previousDiseno = publicUrl ? await this.disenosService.findById(Number(id)) : null;

        try {
            const diseno = await this.disenosService.update(Number(id), data, publicUrl);
            if (publicUrl && previousDiseno?.url_foto) {
                await this.deleteRemoteFotoByPublicUrl(sftp, previousDiseno.url_foto).catch(() => undefined);
            }
            res.status(200).json(diseno);
        } catch (error) {
            if (remotePath) {
                await sftp.delete(remotePath).catch(() => undefined);
            }
            throw error;
        }
    }

    @Delete(':id')
    async delete(@Param('id') id: string) {
        const sftp = await SftpSingleton.getInstance();
        const result = await this.disenosService.delete(Number(id));
        await this.deleteRemoteFotoByPublicUrl(sftp, result.url_foto).catch(() => undefined);
        return result;
    }

    private runMulter(req: Request, res: Response): Promise<void> {
        return new Promise((resolve, reject) => {
            upload.single('file')(req, res, (error: unknown) => {
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
        return `${Date.now()}_${safeBase || 'diseno'}_${suffix}${extension}`;
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

    private async deleteRemoteFotoByPublicUrl(sftp: { delete: (path: string) => Promise<unknown> }, fotoUrl: string): Promise<void> {
        const pathname = new URL(fotoUrl).pathname;
        const expectedPrefix = `/files${PUBLIC_PRODUCTS_PATH}/`;
        if (!pathname.startsWith(expectedPrefix)) {
            return;
        }
        const relativePath = pathname.slice(expectedPrefix.length);
        await sftp.delete(`${REMOTE_PRODUCTS_BASE_PATH}/${relativePath}`);
    }
}
