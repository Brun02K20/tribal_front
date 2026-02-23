import { BadRequestException, Controller, Post, Req, Res } from '@nestjs/common';
import { ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { promises as fs } from 'fs';
import path from 'path';
import SftpSingleton from '../utils/sftp/sftp_instance';
import { upload } from '../utils/sftp/upload';
import { FotosService } from './fotos.service';

const REMOTE_BASE_PATH = '/var/www/tribal_trend/files';
const PUBLIC_FILES_PATH = '/files';
const PUBLIC_BASE_URL = 'https://tribaltrend.com.ar';

@ApiTags('Fotos')
@Controller('fotos')
export class FotosController {
	constructor(private readonly fotosService: FotosService) {}

	@Post('upload')
	@ApiConsumes('multipart/form-data')
	@ApiBody({
		schema: {
			type: 'object',
			required: ['file'],
			properties: {
				file: { type: 'string', format: 'binary' },
			},
		},
	})
	async uploadFoto(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
		await this.runMulter(req, res);

		const file = req.file as Express.Multer.File | undefined;
		if (!file) {
			throw new BadRequestException('Archivo es obligatorio');
		}

		const fileName = this.buildFileName(file.originalname);
		const remotePath = `${REMOTE_BASE_PATH}/${fileName}`;

		const sftp = await SftpSingleton.getInstance();
		try {
			await sftp.put(file.path, remotePath);
		} finally {
			await fs.unlink(file.path).catch(() => undefined);
		}

		const publicUrl = this.buildPublicUrl(req, fileName);
		const foto = await this.fotosService.create(publicUrl, null);

		return {
			ok: true,
			foto,
		};
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
		return `${Date.now()}_${safeBase || 'file'}_${suffix}${extension}`;
	}

	private buildPublicUrl(req: Request, fileName: string): string {
		return `${PUBLIC_BASE_URL}${PUBLIC_FILES_PATH}/${fileName}`;
	}
}
