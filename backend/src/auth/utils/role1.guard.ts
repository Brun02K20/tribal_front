import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import type { Request } from 'express';

@Injectable()
export class Role1Guard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request & { user?: { id_rol?: number } }>();
    const userRole = request.user?.id_rol;

    if (userRole !== 1) {
      throw new ForbiddenException('Solo administradores con id_rol = 1 pueden ejecutar esta acción');
    }

    return true;
  }
}
