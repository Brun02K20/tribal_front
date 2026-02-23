import {
	BadRequestException,
	Injectable,
	UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Usuarios } from './models/Usuarios';
import { GoogleInput, GoogleTokenInfo, LoginInput, RegisterInput } from './types/auth.types';

const jwtExpiresInSeconds = Number(process.env.JWT_EXPIRES_IN_SECONDS ?? 86400);


@Injectable()
export class AuthService {
	constructor(private readonly jwtService: JwtService) {}

	async register(data: RegisterInput) {
		const existing = await Usuarios.findOne({ where: { email: data.email } });
		if (existing) {
			throw new BadRequestException('El email ya está registrado');
		}

		const password_hash = await bcrypt.hash(data.password, 10);
		const user = await Usuarios.create({
			nombre: data.nombre,
			username: data.username ?? null,
			email: data.email,
			telefono: data.telefono ?? null,
			password_hash,
			google_id: null,
			id_rol: data.id_rol ?? 2,
		});

		return this.buildAuthResponse(user);
	}

	async login(data: LoginInput) {
		const user = await Usuarios.findOne({ where: { email: data.email } });
		if (!user || !user.password_hash) {
			throw new UnauthorizedException('Credenciales inválidas');
		}

		const isPasswordValid = await bcrypt.compare(data.password, user.password_hash);
		if (!isPasswordValid) {
			throw new UnauthorizedException('Credenciales inválidas');
		}

		return this.buildAuthResponse(user);
	}

	async registerWithGoogle(data: GoogleInput) {
		const googleData = await this.verifyGoogleIdToken(data.idToken);
		const existingByEmail = await Usuarios.findOne({ where: { email: googleData.email } });
		if (existingByEmail) {
			throw new BadRequestException('Ya existe una cuenta con este email');
		}

		const existingByGoogle = await Usuarios.findOne({ where: { google_id: googleData.sub } });
		if (existingByGoogle) {
			throw new BadRequestException('Esta cuenta de Google ya está registrada');
		}

		const user = await Usuarios.create({
			nombre: data.nombre || googleData.name || 'Usuario Google',
			username: data.username ?? null,
			email: googleData.email,
			telefono: data.telefono ?? null,
			password_hash: null,
			google_id: googleData.sub,
			id_rol: data.id_rol ?? 2,
		});

		return this.buildAuthResponse(user);
	}

	async loginWithGoogle(idToken: string) {
		const googleData = await this.verifyGoogleIdToken(idToken);

		let user = await Usuarios.findOne({ where: { google_id: googleData.sub } });

		if (!user) {
			const existingByEmail = await Usuarios.findOne({ where: { email: googleData.email } });
			if (!existingByEmail) {
				throw new UnauthorizedException('No existe una cuenta registrada para este Google');
			}

			existingByEmail.google_id = googleData.sub;
			await existingByEmail.save();
			user = existingByEmail;
		}

		return this.buildAuthResponse(user);
	}

	private async verifyGoogleIdToken(idToken: string): Promise<GoogleTokenInfo> {
		if (!idToken) {
			throw new BadRequestException('idToken es obligatorio');
		}

		const response = await fetch(
			`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`,
		);

		if (!response.ok) {
			throw new UnauthorizedException('Token de Google inválido');
		}

		const tokenInfo = (await response.json()) as GoogleTokenInfo;

		if (!tokenInfo.email || !tokenInfo.sub || tokenInfo.email_verified !== 'true') {
			throw new UnauthorizedException('No se pudo validar la identidad de Google');
		}

		const expectedAud = process.env.GOOGLE_CLIENT_ID;
		if (expectedAud) {
			const payload = tokenInfo as GoogleTokenInfo & { aud?: string };
			if (!payload.aud || payload.aud !== expectedAud) {
				throw new UnauthorizedException('El token de Google no pertenece a esta aplicación');
			}
		}

		return tokenInfo;
	}

	private buildAuthResponse(user: Usuarios) {
		const payload = {
			sub: user.id,
			email: user.email,
			id_rol: user.id_rol,
			nombre: user.nombre,
		};

		const token = this.jwtService.sign(payload, {
			secret: process.env.JWT_SECRET,
			expiresIn: jwtExpiresInSeconds,
		});

		return {
			token,
			user: {
				id: user.id,
				nombre: user.nombre,
				username: user.username,
				email: user.email,
				telefono: user.telefono,
				google_id: user.google_id,
				id_rol: user.id_rol,
			},
		};
	}
}
