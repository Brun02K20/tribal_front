import { Body, Controller, Post } from '@nestjs/common';
import { ApiBody, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import {
	GoogleLoginDto,
	GoogleRegisterDto,
	LoginDto,
	RegisterDto,
} from './DTOs/auth.dto';

@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Post('register')
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
		schema: {
			type: 'object',
			properties: {
				token: {
					type: 'string',
					example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...jwt',
				},
				user: {
					type: 'object',
					properties: {
						id: { type: 'number', example: 1 },
						nombre: { type: 'string', example: 'Juan Perez' },
						username: { type: 'string', example: 'juanp' },
						email: { type: 'string', example: 'juan@example.com' },
						telefono: { type: 'string', example: '+54 11 5555-1234' },
						google_id: { type: 'string', example: null },
						id_rol: { type: 'number', example: 2 },
					},
				},
			},
		},
	})
	register(@Body() body: RegisterDto) {
		return this.authService.register(body);
	}

	@Post('login')
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
		schema: {
			type: 'object',
			properties: {
				token: {
					type: 'string',
					example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...jwt',
				},
				user: {
					type: 'object',
					properties: {
						id: { type: 'number', example: 1 },
						nombre: { type: 'string', example: 'Juan Perez' },
						username: { type: 'string', example: 'juanp' },
						email: { type: 'string', example: 'juan@example.com' },
						telefono: { type: 'string', example: '+54 11 5555-1234' },
						google_id: { type: 'string', example: null },
						id_rol: { type: 'number', example: 2 },
					},
				},
			},
		},
	})
	login(@Body() body: LoginDto) {
		return this.authService.login(body);
	}

	@Post('google/register')
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
		schema: {
			type: 'object',
			properties: {
				token: {
					type: 'string',
					example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...jwt',
				},
				user: {
					type: 'object',
					properties: {
						id: { type: 'number', example: 10 },
						nombre: { type: 'string', example: 'Juan Perez' },
						username: { type: 'string', example: 'juanp' },
						email: { type: 'string', example: 'juan@example.com' },
						telefono: { type: 'string', example: '+54 11 5555-1234' },
						google_id: { type: 'string', example: 'google-sub-id' },
						id_rol: { type: 'number', example: 2 },
					},
				},
			},
		},
	})
	registerWithGoogle(@Body() body: GoogleRegisterDto) {
		return this.authService.registerWithGoogle({
			idToken: body.idToken,
			nombre: body.nombre ?? '',
			username: body.username,
			email: body.email ?? '',
			telefono: body.telefono,
			id_rol: body.id_rol,
		});
	}

	@Post('google/login')
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
		schema: {
			type: 'object',
			properties: {
				token: {
					type: 'string',
					example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...jwt',
				},
				user: {
					type: 'object',
					properties: {
						id: { type: 'number', example: 10 },
						nombre: { type: 'string', example: 'Juan Perez' },
						username: { type: 'string', example: 'juanp' },
						email: { type: 'string', example: 'juan@example.com' },
						telefono: { type: 'string', example: '+54 11 5555-1234' },
						google_id: { type: 'string', example: 'google-sub-id' },
						id_rol: { type: 'number', example: 2 },
					},
				},
			},
		},
	})
	loginWithGoogle(@Body() body: GoogleLoginDto) {
		return this.authService.loginWithGoogle(body.idToken);
	}
}
