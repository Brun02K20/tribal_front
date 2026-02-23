// file: src/common/decorators/token.decorator.ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const Token = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const authHeader = request.headers?.authorization;

    if (typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
      return authHeader.slice(7).trim();
    }

    const cookie = request.headers?.cookie;
    if (typeof cookie === 'string') {
      const cookieMatch = cookie.match(/(?:^|;\s*)access_token=([^;]+)/);
      if (cookieMatch?.[1]) {
        return decodeURIComponent(cookieMatch[1]);
      }
    }

    return null;
  },
);