import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { ForbiddenException, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { createHmac } from 'crypto';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { ChatUserPayload, ClientChatIdentity } from './types/chat.types';
import { AUTH_COOKIE_NAME } from 'src/auth/utils/auth-cookie';

type ChatSocket = Socket & {
  data: {
    user?: ChatUserPayload;
    clientIdentity?: ClientChatIdentity;
  };
};

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL?.split(',') ?? true,
    credentials: true,
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  declare server: Server;

  private readonly logger = new Logger(ChatGateway.name);

  constructor(
    private readonly chatService: ChatService,
    private readonly jwtService: JwtService,
  ) {}

  emitNewMessage(payload: {
    conversationId: string;
    clienteId?: number;
    clienteNombre?: string;
    message: {
      _id?: unknown;
      conversacion_id?: unknown;
      autor_id?: unknown;
      rol?: unknown;
      fecha_creacion?: unknown;
      contenido?: unknown;
      leido?: unknown;
    };
    ultimoMensaje?: string;
    ultimoMensajeFecha?: unknown;
  }) {
    this.server.to(`conversation:${payload.conversationId}`).emit('chat:new-message', {
      conversacion_id: payload.conversationId,
      message: payload.message,
    });
    this.server.to('admins').emit('chat:conversation-updated', {
      conversacion_id: payload.conversationId,
      cliente_id: payload.clienteId,
      cliente_nombre: payload.clienteNombre,
      ultimo_mensaje: payload.ultimoMensaje ?? String(payload.message.contenido ?? ''),
      ultimo_mensaje_fecha: payload.ultimoMensajeFecha ?? payload.message.fecha_creacion,
      autor_rol: payload.message.rol,
    });
  }

  emitReadUpdated(payload: {
    conversationId: string;
    readerId: number;
    readerRole: 'admin' | 'cliente';
  }) {
    this.server.to(`conversation:${payload.conversationId}`).emit('chat:read-updated', {
      conversacion_id: payload.conversationId,
      reader_id: payload.readerId,
      reader_role: payload.readerRole,
    });
  }

  private extractCookie(client: Socket, name: string): string | null {
    const match = client.handshake.headers.cookie
      ?.match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`));
    return match?.[1] ? decodeURIComponent(match[1]) : null;
  }

  private extractToken(client: Socket): string | null {
    const authToken = client.handshake.auth?.token;
    if (typeof authToken === 'string' && authToken.trim()) return authToken;
    const authorization = client.handshake.headers.authorization;
    if (typeof authorization === 'string') {
      const [type, token] = authorization.split(' ');
      if (type === 'Bearer' && token) return token;
    }
    return this.extractCookie(client, AUTH_COOKIE_NAME);
  }

  private getClientIdentity(client: Socket, clienteId?: number): ClientChatIdentity {
    const visitorToken = this.extractCookie(client, 'tribal_chat_visitor');
    if (!visitorToken || !/^[0-9a-f-]{36}$/i.test(visitorToken)) {
      throw new UnauthorizedException('Primero debe inicializarse la conversación');
    }
    const forwarded = client.handshake.headers['cf-connecting-ip']
      ?? client.handshake.headers['x-real-ip'];
    const ip = String(
      Array.isArray(forwarded)
        ? forwarded[0]
        : forwarded ?? client.handshake.address ?? 'unknown',
    ).split(',')[0].trim();
    const secret = process.env.CHAT_IDENTITY_SECRET
      ?? process.env.JWT_SECRET
      ?? 'chat-development-secret';
    const digest = (value: string) =>
      createHmac('sha256', secret).update(value).digest('hex');
    return {
      ...(clienteId ? { clienteId } : {}),
      visitanteId: digest(visitorToken),
      ipHash: digest(ip),
    };
  }

  async handleConnection(client: ChatSocket) {
    try {
      const token = this.extractToken(client);
      if (token) {
        try {
          const user = await this.jwtService.verifyAsync<ChatUserPayload>(token, {
            secret: process.env.JWT_SECRET,
          });
          client.data.user = user;
          client.join(`user:${user.sub}`);
          if (user.id_rol === 1) {
            client.join('admins');
            return;
          }
          if (user.id_rol !== 2) {
            throw new ForbiddenException('No tenés permisos para usar el chat');
          }
          client.data.clientIdentity = this.getClientIdentity(client, user.sub);
        } catch (error) {
          if (error instanceof ForbiddenException) throw error;
          client.data.clientIdentity = this.getClientIdentity(client);
        }
      } else {
        client.data.clientIdentity = this.getClientIdentity(client);
      }

      const conversation = await this.chatService.getOrCreateConversationForIdentity(
        client.data.clientIdentity,
      );
      client.join(`conversation:${String(conversation._id)}`);
    } catch (error) {
      this.logger.warn(`Socket rechazado: ${error instanceof Error ? error.message : 'unknown_error'}`);
      client.disconnect(true);
    }
  }

  handleDisconnect(client: ChatSocket) {
    if (client.data.user) {
      this.logger.log(`Socket desconectado user=${client.data.user.sub}`);
    }
  }

  @SubscribeMessage('chat:join')
  async joinConversation(
    @ConnectedSocket() client: ChatSocket,
    @MessageBody() payload: { conversacion_id: string },
  ) {
    const conversation = await this.getAuthorizedConversation(client, payload.conversacion_id);
    client.join(`conversation:${String(conversation._id)}`);
    await this.markReadForSocket(client, payload.conversacion_id);
    return { ok: true, conversacion_id: String(conversation._id) };
  }

  @SubscribeMessage('chat:send')
  async sendMessage(
    @ConnectedSocket() client: ChatSocket,
    @MessageBody() payload: { conversacion_id?: string; contenido: string },
  ) {
    const identity = client.data.clientIdentity;
    const user = client.data.user;
    if (!identity && (!user || user.id_rol !== 1)) {
      throw new UnauthorizedException('No se pudo identificar al remitente');
    }
    const result = identity
      ? await this.chatService.sendClientMessage(identity, payload.contenido)
      : await this.chatService.sendMessage({
          conversacion_id: payload.conversacion_id,
          contenido: payload.contenido,
          autor_id: user!.sub,
          rol: 'admin',
        });
    const conversationId = String(result.message.conversacion_id);
    this.emitNewMessage({
      conversationId,
      clienteId: Number(result.conversation?.cliente_id),
      clienteNombre: String(result.conversation?.cliente_nombre ?? ''),
      message: result.message,
      ultimoMensaje: result.conversation?.ultimo_mensaje ?? String(result.message.contenido ?? ''),
      ultimoMensajeFecha: result.message.fecha_creacion,
    });
    return { ok: true, conversacion_id: conversationId, message: result.message };
  }

  @SubscribeMessage('chat:mark-read')
  async markRead(
    @ConnectedSocket() client: ChatSocket,
    @MessageBody() payload: { conversacion_id: string },
  ) {
    const conversation = await this.getAuthorizedConversation(client, payload.conversacion_id);
    await this.markReadForSocket(client, payload.conversacion_id);
    return { ok: true, conversacion_id: String(conversation._id) };
  }

  private async getAuthorizedConversation(client: ChatSocket, conversationId: string) {
    if (client.data.clientIdentity) {
      return this.chatService.assertConversationAccessForIdentity(
        conversationId,
        client.data.clientIdentity,
      );
    }
    if (client.data.user?.id_rol === 1) {
      return this.chatService.assertConversationAccess(
        conversationId,
        client.data.user.sub,
        1,
      );
    }
    throw new UnauthorizedException('No se pudo identificar al usuario');
  }

  private async markReadForSocket(client: ChatSocket, conversationId: string) {
    if (client.data.clientIdentity) {
      await this.chatService.markAsReadForIdentity(conversationId, client.data.clientIdentity);
      this.emitReadUpdated({
        conversationId,
        readerId: client.data.user?.sub ?? 0,
        readerRole: 'cliente',
      });
      return;
    }
    const user = client.data.user;
    if (!user || user.id_rol !== 1) throw new UnauthorizedException();
    await this.chatService.markAsRead(conversationId, user.sub, 1);
    this.emitReadUpdated({
      conversationId,
      readerId: user.sub,
      readerRole: 'admin',
    });
  }
}
