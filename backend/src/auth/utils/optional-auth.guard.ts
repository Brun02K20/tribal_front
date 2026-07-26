import { ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { AUTH_COOKIE_NAME } from './auth-cookie';

@Injectable()
export class OptionalAuthGuard {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const cookies = request.cookies as Record<string, string> | undefined;
    const cookieToken = cookies?.[AUTH_COOKIE_NAME];
    const authorization = request.headers.authorization;
    const bearerToken = authorization?.startsWith('Bearer ') ? authorization.slice(7) : undefined;
    const token = cookieToken ?? bearerToken;

    if (token) {
      try {
        request['user'] = await this.jwtService.verifyAsync(token, {
          secret: process.env.JWT_SECRET,
        });
      } catch {
        // A stale login cookie must not prevent anonymous chat access.
      }
    }
    return true;
  }
}
