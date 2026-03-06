// file: src/common/decorators/token.decorator.ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AUTH_COOKIE_NAME } from './auth-cookie';

export const Token = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const authHeader = request.headers?.authorization;

    if (typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
      return authHeader.slice(7).trim();
    }

    const parsedCookies = request.cookies as Record<string, string> | undefined;
    if (parsedCookies?.[AUTH_COOKIE_NAME]) {
      return parsedCookies[AUTH_COOKIE_NAME];
    }

    const cookie = request.headers?.cookie;
    if (typeof cookie === 'string') {
      const cookieMatch = cookie.match(new RegExp(`(?:^|;\\s*)${AUTH_COOKIE_NAME}=([^;]+)`));
      if (cookieMatch?.[1]) {
        return decodeURIComponent(cookieMatch[1]);
      }
    }

    return null;
  },
);