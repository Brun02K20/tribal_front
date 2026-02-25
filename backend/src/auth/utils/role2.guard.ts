import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import type { Request } from 'express';

@Injectable()
export class Role2Guard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request & { user?: { id_rol?: number } }>();
    const userRole = request.user?.id_rol;

    if (userRole !== 2) {
      throw new ForbiddenException('Solo usuarios con id_rol = 2 pueden ejecutar esta acción');
    }

    return true;
  }
}
