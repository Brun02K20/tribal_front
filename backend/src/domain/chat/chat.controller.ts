import { Body, Controller, ForbiddenException, Get, Param, Patch, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ApiCookieAuth, ApiBody, ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { createHmac, randomUUID } from 'crypto';
import { AuthGuard } from 'src/auth/utils/auth.guard';
import { Role1Guard } from 'src/auth/utils/role1.guard';
import { Role2Guard } from 'src/auth/utils/role2.guard';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { SendMessageDto } from './DTOs/send-message.dto';
import { OptionalAuthGuard } from 'src/auth/utils/optional-auth.guard';

type RequestWithUser = Request & {
  user?: {
    sub?: number;
    id_rol?: number;
  };
};

@ApiTags('Chat')
@ApiCookieAuth('cookieAuth')
@Controller('chat')
export class ChatController {
  constructor(
    private readonly chatService: ChatService,
    private readonly chatGateway: ChatGateway,
  ) {}

  private readonly visitorCookieName = 'tribal_chat_visitor';

  private getPublicIdentity(req: RequestWithUser, res: Response) {
    let visitorToken = req.cookies?.[this.visitorCookieName] as string | undefined;
    if (!visitorToken || !/^[0-9a-f-]{36}$/i.test(visitorToken)) {
      visitorToken = randomUUID();
      const secure = process.env.NODE_ENV === 'production';
      res.cookie(this.visitorCookieName, visitorToken, {
        httpOnly: true,
        secure,
        sameSite: secure ? 'none' : 'lax',
        maxAge: 365 * 24 * 60 * 60 * 1000,
        path: '/',
        domain: process.env.AUTH_COOKIE_DOMAIN || undefined,
      });
    }

    const forwarded = req.headers['cf-connecting-ip'] ?? req.headers['x-real-ip'];
    const ip = String(Array.isArray(forwarded) ? forwarded[0] : forwarded ?? req.ip ?? 'unknown')
      .split(',')[0]
      .trim();
    const secret = process.env.CHAT_IDENTITY_SECRET ?? process.env.JWT_SECRET ?? 'chat-development-secret';
    const digest = (value: string) => createHmac('sha256', secret).update(value).digest('hex');
    const userId = Number(req.user?.sub);

    return {
      clienteId: Number.isInteger(userId) && userId > 0 && Number(req.user?.id_rol) === 2
        ? userId
        : undefined,
      visitanteId: digest(visitorToken),
      ipHash: digest(ip),
    };
  }

  private parseAuthenticatedUserId(value: unknown): number {
    const userId = Number(value);
    if (!Number.isInteger(userId) || userId < 1) {
      throw new ForbiddenException('No se pudo identificar al usuario autenticado');
    }

    return userId;
  }

  private ensureChatRole(userRole: number) {
    if (![1, 2].includes(userRole)) {
      throw new ForbiddenException('No tenés permisos para acceder al chat');
    }
  }

  @Get('conversaciones')
  @UseGuards(AuthGuard, Role1Guard)
  @ApiOperation({ summary: 'Listar conversaciones (solo admin)' })
  @ApiOkResponse({
    description: 'Listado de conversaciones con resumen y no leídos',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '65f8b2e41e6b77f2a1b2c3d4' },
          cliente_id: { type: 'number', example: 13 },
          cliente_nombre: { type: 'string', example: 'Juan Pérez' },
          fecha_creacion: { type: 'string', format: 'date-time' },
          ultimo_mensaje: { type: 'string', example: 'Perfecto, gracias' },
          ultimo_mensaje_fecha: { type: 'string', format: 'date-time' },
          no_leidos: { type: 'number', example: 2 },
        },
      },
    },
  })
  async getConversationsForAdmin() {
    return this.chatService.listConversationsForAdmin();
  }

  @Get('conversaciones/mia')
  @UseGuards(AuthGuard, Role2Guard)
  @ApiOperation({ summary: 'Obtener conversación propia del cliente con su historial' })
  @ApiOkResponse({
    description: 'Conversación del cliente autenticado y sus mensajes',
    schema: {
      type: 'object',
      properties: {
        conversation: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '65f8b2e41e6b77f2a1b2c3d4' },
            cliente_id: { type: 'number', example: 13 },
            fecha_creacion: { type: 'string', format: 'date-time' },
            ultimo_mensaje: { type: 'string', example: 'Necesito soporte' },
          },
        },
        messages: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              _id: { type: 'string', example: '65f8b2e41e6b77f2a1b2c3f9' },
              conversacion_id: { type: 'string', example: '65f8b2e41e6b77f2a1b2c3d4' },
              autor_id: { type: 'number', example: 13 },
              rol: { type: 'string', enum: ['cliente', 'admin'] },
              fecha_creacion: { type: 'string', format: 'date-time' },
              contenido: { type: 'string', example: 'Hola, tengo una consulta' },
              leido: { type: 'boolean', example: false },
            },
          },
        },
      },
    },
  })
  async getOwnConversation(@Req() req: RequestWithUser) {
    const userId = this.parseAuthenticatedUserId(req.user?.sub);
    return this.chatService.getOwnConversationWithMessages(userId);
  }

  @Get('publico')
  @UseGuards(OptionalAuthGuard)
  @ApiOperation({ summary: 'Obtener el chat del comprador, con o sin sesión iniciada' })
  async getPublicConversation(
    @Req() req: RequestWithUser,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.chatService.getConversationForIdentityWithMessages(this.getPublicIdentity(req, res));
  }

  @Post('publico/mensajes')
  @UseGuards(OptionalAuthGuard)
  @ApiOperation({ summary: 'Enviar un mensaje como comprador o visitante' })
  async sendPublicMessage(
    @Body() body: SendMessageDto,
    @Req() req: RequestWithUser,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.chatService.sendClientMessage(
      this.getPublicIdentity(req, res),
      body.contenido,
    );
    this.chatGateway.emitNewMessage({
      conversationId: String(result.message.conversacion_id),
      clienteId: Number(result.conversation?.cliente_id ?? 0),
      clienteNombre: String(result.conversation?.cliente_nombre ?? 'Visitante'),
      message: result.message,
      ultimoMensaje: String(result.message.contenido),
      ultimoMensajeFecha: result.message.fecha_creacion,
    });
    return result;
  }

  @Get('conversaciones/:id/mensajes')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Obtener mensajes de una conversación (admin o cliente propietario)' })
  @ApiParam({ name: 'id', type: String, description: 'ID de la conversación', example: '65f8b2e41e6b77f2a1b2c3d4' })
  @ApiOkResponse({
    description: 'Listado de mensajes de la conversación',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '65f8b2e41e6b77f2a1b2c3f9' },
          conversacion_id: { type: 'string', example: '65f8b2e41e6b77f2a1b2c3d4' },
          autor_id: { type: 'number', example: 1 },
          rol: { type: 'string', enum: ['cliente', 'admin'] },
          fecha_creacion: { type: 'string', format: 'date-time' },
          contenido: { type: 'string', example: 'Te respondo en breve' },
          leido: { type: 'boolean', example: true },
        },
      },
    },
  })
  async getMessages(
    @Param('id') id: string,
    @Req() req: RequestWithUser,
  ) {
    const userId = Number(req.user?.sub);
    const userRole = Number(req.user?.id_rol);
    this.ensureChatRole(userRole);

    return this.chatService.getMessagesByConversation(id, userId, userRole);
  }

  @Post('mensajes')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Enviar mensaje en una conversación' })
  @ApiBody({ type: SendMessageDto })
  @ApiCreatedResponse({
    description: 'Mensaje creado correctamente',
    schema: {
      type: 'object',
      properties: {
        conversation: { type: 'object' },
        message: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '65f8b2e41e6b77f2a1b2c3f9' },
            conversacion_id: { type: 'string', example: '65f8b2e41e6b77f2a1b2c3d4' },
            autor_id: { type: 'number', example: 13 },
            rol: { type: 'string', enum: ['cliente', 'admin'] },
            fecha_creacion: { type: 'string', format: 'date-time' },
            contenido: { type: 'string', example: 'Gracias por responder' },
            leido: { type: 'boolean', example: false },
          },
        },
      },
    },
  })
  async sendMessage(
    @Body() body: SendMessageDto,
    @Req() req: RequestWithUser,
  ) {
    const userId = Number(req.user?.sub);
    const userRole = Number(req.user?.id_rol);
    this.ensureChatRole(userRole);

    const result = await this.chatService.sendMessage({
      conversacion_id: body.conversacion_id,
      contenido: body.contenido,
      autor_id: userId,
      rol: userRole === 1 ? 'admin' : 'cliente',
    });

    this.chatGateway.emitNewMessage({
      conversationId: String(result.message.conversacion_id),
      clienteId: Number(result.conversation?.cliente_id),
      clienteNombre: String(result.conversation?.cliente_nombre ?? ''),
      message: result.message,
      ultimoMensaje: result.conversation?.ultimo_mensaje ?? String(result.message.contenido ?? ''),
      ultimoMensajeFecha: result.message.fecha_creacion,
    });

    return result;
  }

  @Patch('conversaciones/:id/leido')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Marcar como leídos los mensajes de la conversación' })
  @ApiParam({ name: 'id', type: String, description: 'ID de la conversación', example: '65f8b2e41e6b77f2a1b2c3d4' })
  @ApiOkResponse({
    description: 'Mensajes marcados como leídos',
    schema: {
      type: 'object',
      properties: {
        ok: { type: 'boolean', example: true },
      },
    },
  })
  async markConversationRead(
    @Param('id') id: string,
    @Req() req: RequestWithUser,
  ) {
    const userId = Number(req.user?.sub);
    const userRole = Number(req.user?.id_rol);
    this.ensureChatRole(userRole);

    const result = await this.chatService.markAsRead(id, userId, userRole);

    this.chatGateway.emitReadUpdated({
      conversationId: id,
      readerId: userId,
      readerRole: userRole === 1 ? 'admin' : 'cliente',
    });

    return result;
  }
}


