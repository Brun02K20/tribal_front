import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Request } from 'express';
import { Pedidos } from '../models/Pedidos';

type AuthUser = {
  sub?: number;
  id_rol?: number;
};

type RequestWithUser = Request & {
  user?: AuthUser;
  query?: Record<string, unknown>;
};

@Injectable()
export class Role1OrOwnerPedidoGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Usuario no autenticado');
    }

    if (user.id_rol === 1) {
      return true;
    }

    if (user.id_rol !== 2) {
      throw new ForbiddenException('No tenés permisos para acceder a este recurso');
    }

    const userId = Number(user.sub);
    const idUsuarioParam = request.params?.id_usuario;
    const pedidoIdParam = request.params?.id;
    const idUsuarioQueryRaw = request.query?.id_usuario;
    const idUsuarioQuery =
      typeof idUsuarioQueryRaw === 'string'
        ? Number(idUsuarioQueryRaw)
        : typeof idUsuarioQueryRaw === 'number'
          ? idUsuarioQueryRaw
          : undefined;

    if (idUsuarioParam) {
      const idUsuario = Number(idUsuarioParam);
      if (!idUsuario || idUsuario !== userId) {
        throw new ForbiddenException('Solo podés acceder a tus propios pedidos');
      }
      return true;
    }

    if (idUsuarioQuery !== undefined) {
      if (!idUsuarioQuery || idUsuarioQuery !== userId) {
        throw new ForbiddenException('Solo podés acceder a tus propios pedidos');
      }
      return true;
    }

    if (request.path?.includes('/filters')) {
      throw new ForbiddenException('Para filtrar pedidos debés indicar tu id_usuario');
    }

    if (pedidoIdParam) {
      const pedidoId = Number(pedidoIdParam);
      if (!pedidoId) {
        throw new ForbiddenException('ID de pedido inválido');
      }

      const pedido = await Pedidos.findByPk(pedidoId, {
        attributes: ['id', 'id_usuario'],
      });

      if (!pedido) {
        throw new NotFoundException('Pedido no encontrado');
      }

      if (Number(pedido.id_usuario) !== userId) {
        throw new ForbiddenException('Solo podés acceder a tus propios pedidos');
      }

      return true;
    }

    throw new ForbiddenException('No tenés permisos para acceder a este recurso');
  }
}
