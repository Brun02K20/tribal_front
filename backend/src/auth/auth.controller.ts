import { Body, Controller, Get, HttpCode, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ApiBody, ApiCookieAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { AuthGuard } from './utils/auth.guard';
import type { Request, Response } from 'express';
import {
	GoogleLoginDto,
	GoogleRegisterDto,
	LoginDto,
	RegisterDto,
} from './DTOs/auth.dto';
import { clearAuthCookie, setAuthCookie } from './utils/auth-cookie';

const authUserSchema = {
	type: 'object',
	properties: {
		id: { type: 'number', example: 1 },
		nombre: { type: 'string', example: 'Juan Perez' },
		username: { type: 'string', nullable: true, example: 'juanp' },
		email: { type: 'string', example: 'juan@example.com' },
		telefono: { type: 'string', nullable: true, example: '+54 11 5555-1234' },
		google_id: { type: 'string', nullable: true, example: null },
		id_rol: { type: 'number', example: 2 },
	},
};

const authSessionSchema = {
	type: 'object',
	properties: {
		user: authUserSchema,
	},
};

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Post('register')
	@ApiOperation({ summary: 'Registro con email/password y creación de sesión por cookie HTTP-only' })
	@ApiBody({
		schema: {
			type: 'object',
			required: ['nombre', 'email', 'password'],
			properties: {
				nombre: { type: 'string', example: 'Juan Perez' },
				username: { type: 'string', example: 'juanp' },
				email: { type: 'string', example: 'juan@example.com' },
				telefono: { type: 'string', example: '+54 11 5555-1234' },
				password: { type: 'string', example: 'P4ssw0rd!' },
				id_rol: { type: 'number', example: 2 },
			},
		},
	})
	@ApiResponse({
		status: 201,
		description: 'Sesión iniciada. El token se envía en Set-Cookie (HTTP-only).',
		schema: authSessionSchema,
	})
	async register(@Body() body: RegisterDto, @Res({ passthrough: true }) response: Response) {
		const result = await this.authService.register(body);
		setAuthCookie(response, result.token);
		return { user: result.user };
	}

	@Post('login')
	@ApiOperation({ summary: 'Login con email/password y creación de sesión por cookie HTTP-only' })
	@ApiBody({
		schema: {
			type: 'object',
			required: ['email', 'password'],
			properties: {
				email: { type: 'string', example: 'juan@example.com' },
				password: { type: 'string', example: 'P4ssw0rd!' },
			},
		},
	})
	@ApiResponse({
		status: 200,
		description: 'Sesión iniciada. El token se envía en Set-Cookie (HTTP-only).',
		schema: authSessionSchema,
	})
	async login(@Body() body: LoginDto, @Res({ passthrough: true }) response: Response) {
		const result = await this.authService.login(body);
		setAuthCookie(response, result.token);
		return { user: result.user };
	}

	@Post('google/register')
	@ApiOperation({ summary: 'Registro con Google y creación de sesión por cookie HTTP-only' })
	@ApiBody({
		schema: {
			type: 'object',
			required: ['idToken'],
			properties: {
				idToken: {
					type: 'string',
					example: 'eyJhbGciOiJSUzI1NiIsImtpZCI6Ij...google-id-token...',
				},
				nombre: { type: 'string', example: 'Juan Perez' },
				username: { type: 'string', example: 'juanp' },
				email: { type: 'string', example: 'juan@example.com' },
				telefono: { type: 'string', example: '+54 11 5555-1234' },
				id_rol: { type: 'number', example: 2 },
			},
		},
	})
	@ApiResponse({
		status: 201,
		description: 'Sesión iniciada. El token se envía en Set-Cookie (HTTP-only).',
		schema: authSessionSchema,
	})
	async registerWithGoogle(@Body() body: GoogleRegisterDto, @Res({ passthrough: true }) response: Response) {
		const result = await this.authService.registerWithGoogle({
			idToken: body.idToken,
			nombre: body.nombre ?? '',
			username: body.username,
			email: body.email ?? '',
			telefono: body.telefono,
			id_rol: body.id_rol,
		});
		setAuthCookie(response, result.token);
		return { user: result.user };
	}

	@Post('google/login')
	@ApiOperation({ summary: 'Login con Google y creación de sesión por cookie HTTP-only' })
	@ApiBody({
		schema: {
			type: 'object',
			required: ['idToken'],
			properties: {
				idToken: {
					type: 'string',
					example: 'eyJhbGciOiJSUzI1NiIsImtpZCI6Ij...google-id-token...',
				},
			},
		},
	})
	@ApiResponse({
		status: 200,
		description: 'Sesión iniciada. El token se envía en Set-Cookie (HTTP-only).',
		schema: authSessionSchema,
	})
	async loginWithGoogle(@Body() body: GoogleLoginDto, @Res({ passthrough: true }) response: Response) {
		const result = await this.authService.loginWithGoogle(body.idToken);
		setAuthCookie(response, result.token);
		return { user: result.user };
	}

	@UseGuards(AuthGuard)
	@Get('me')
	@ApiCookieAuth('cookieAuth')
	@ApiOperation({ summary: 'Obtener usuario de la sesión actual (cookie HTTP-only)' })
	@ApiResponse({
		status: 200,
		schema: authSessionSchema,
	})
	me(@Req() request: Request & { user?: { sub?: number } }) {
		const userId = Number(request.user?.sub ?? 0);
		return this.authService.getSessionUser(userId);
	}

	@Post('logout')
	@HttpCode(200)
	@ApiOperation({ summary: 'Cerrar sesión y limpiar cookie HTTP-only' })
	@ApiResponse({
		status: 200,
		schema: {
			type: 'object',
			properties: {
				ok: { type: 'boolean', example: true },
			},
		},
	})
	logout(@Res({ passthrough: true }) response: Response) {
		clearAuthCookie(response);
		return { ok: true };
	}
}

