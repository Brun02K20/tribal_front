import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Post('register')
	register(
		@Body()
		body: {
			nombre: string;
			username?: string;
			email: string;
			telefono?: string;
			password: string;
			id_rol?: number;
		},
	) {
		return this.authService.register(body);
	}

	@Post('login')
	login(@Body() body: { email: string; password: string }) {
		return this.authService.login(body);
	}

	@Post('google/register')
	registerWithGoogle(
		@Body()
		body: {
			idToken: string;
			nombre?: string;
			username?: string;
			email?: string;
			telefono?: string;
			id_rol?: number;
		},
	) {
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
	loginWithGoogle(@Body() body: { idToken: string }) {
		return this.authService.loginWithGoogle(body.idToken);
	}
}
