import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard as PassportAuthGuard } from '@nestjs/passport';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { AUTH_COOKIE_NAME } from './auth-cookie';

@Injectable()
export class AuthGuard extends PassportAuthGuard('jwt') {
  constructor(private readonly jwtService: JwtService) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const token = this.extractToken(request);
    if (!token) {
      throw new UnauthorizedException('No se encontró token JWT en la solicitud');
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET,
      });
      request['user'] = payload;
      return true;
    } catch {
      throw new UnauthorizedException('Token inválido o expirado');
    }
  }

  /**
   * Extract JWT from cookies or Authorization header.
   */
  private extractToken(request: Request): string | undefined {
    const parsedCookies = request['cookies'] as Record<string, string> | undefined;
    const cookieToken = parsedCookies?.[AUTH_COOKIE_NAME];
    if (cookieToken) {
      return cookieToken;
    }

    const cookie = request.headers.cookie;
    const cookieMatch = cookie?.match(new RegExp(`(?:^|;\\s*)${AUTH_COOKIE_NAME}=([^;]+)`));
    if (cookieMatch?.[1]) return decodeURIComponent(cookieMatch[1]);

    const authHeader = request.headers['authorization'];
    if (authHeader && typeof authHeader === 'string') {
      const [type, token] = authHeader.split(' ');
      if (type === 'Bearer' && token) return token;
    }

    return undefined;
  }
}