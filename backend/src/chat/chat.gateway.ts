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
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { ChatUserPayload } from './types/chat.types';

type SocketWithUser = Socket & { data: { user?: ChatUserPayload } };

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
    const room = `conversation:${payload.conversationId}`;

    this.server.to(room).emit('chat:new-message', {
      conversacion_id: payload.conversationId,
      message: payload.message,
    });

    this.server.to('admins').emit('chat:conversation-updated', {
      conversacion_id: payload.conversationId,
      ultimo_mensaje: payload.ultimoMensaje ?? String(payload.message.contenido ?? ''),
      ultimo_mensaje_fecha: payload.ultimoMensajeFecha ?? payload.message.fecha_creacion,
    });
  }

  emitReadUpdated(payload: {
    conversationId: string;
    readerId: number;
    readerRole: 'admin' | 'cliente';
  }) {
    const room = `conversation:${payload.conversationId}`;
    this.server.to(room).emit('chat:read-updated', {
      conversacion_id: payload.conversationId,
      reader_id: payload.readerId,
      reader_role: payload.readerRole,
    });
  }

  private ensureChatRole(role: number) {
    if (![1, 2].includes(role)) {
      throw new ForbiddenException('No tenés permisos para usar el chat');
    }
  }

  private extractToken(client: Socket): string | null {
    const authToken = client.handshake.auth?.token;
    if (typeof authToken === 'string' && authToken.trim()) {
      return authToken;
    }

    const authorization = client.handshake.headers.authorization;
    if (typeof authorization === 'string') {
      const [type, token] = authorization.split(' ');
      if (type === 'Bearer' && token) {
        return token;
      }
    }

    const cookie = client.handshake.headers.cookie;
    const cookieMatch = cookie?.match(/(?:^|;\s*)access_token=([^;]+)/);
    if (cookieMatch?.[1]) {
      return decodeURIComponent(cookieMatch[1]);
    }

    return null;
  }

  private async authenticate(client: Socket): Promise<ChatUserPayload> {
    const token = this.extractToken(client);
    if (!token) {
      throw new UnauthorizedException('No se encontró token de autenticación');
    }

    return this.jwtService.verifyAsync<ChatUserPayload>(token, {
      secret: process.env.JWT_SECRET,
    });
  }

  async handleConnection(client: SocketWithUser) {
    try {
      const user = await this.authenticate(client);
      client.data.user = user;

      client.join(`user:${user.sub}`);

      if (user.id_rol === 1) {
        client.join('admins');
      }

      if (user.id_rol === 2) {
        const conversation = await this.chatService.getOrCreateConversationForClient(user.sub);
        client.join(`conversation:${String(conversation._id)}`);
      }
    } catch (error) {
      this.logger.warn(`Socket rechazado: ${error instanceof Error ? error.message : 'unknown_error'}`);
      client.disconnect(true);
    }
  }

  handleDisconnect(client: SocketWithUser) {
    if (client.data.user) {
      this.logger.log(`Socket desconectado user=${client.data.user.sub}`);
    }
  }

  @SubscribeMessage('chat:join')
  async joinConversation(
    @ConnectedSocket() client: SocketWithUser,
    @MessageBody() payload: { conversacion_id: string },
  ) {
    const user = client.data.user;
    if (!user) {
      throw new UnauthorizedException('Usuario no autenticado');
    }
    this.ensureChatRole(user.id_rol);

    const conversation = await this.chatService.assertConversationAccess(payload.conversacion_id, user.sub, user.id_rol);
    const room = `conversation:${String(conversation._id)}`;
    client.join(room);

    await this.chatService.markAsRead(String(conversation._id), user.sub, user.id_rol);
    this.emitReadUpdated({
      conversationId: String(conversation._id),
      readerId: user.sub,
      readerRole: user.id_rol === 1 ? 'admin' : 'cliente',
    });

    return { ok: true, conversacion_id: String(conversation._id) };
  }

  @SubscribeMessage('chat:send')
  async sendMessage(
    @ConnectedSocket() client: SocketWithUser,
    @MessageBody() payload: { conversacion_id?: string; contenido: string },
  ) {
    const user = client.data.user;
    if (!user) {
      throw new UnauthorizedException('Usuario no autenticado');
    }

    if (![1, 2].includes(user.id_rol)) {
      throw new ForbiddenException('No tenés permisos para usar el chat');
    }

    const result = await this.chatService.sendMessage({
      conversacion_id: payload.conversacion_id,
      contenido: payload.contenido,
      autor_id: user.sub,
      rol: user.id_rol === 1 ? 'admin' : 'cliente',
    });

    const conversationId = String(result.message.conversacion_id);
    this.emitNewMessage({
      conversationId,
      message: result.message,
      ultimoMensaje: result.conversation?.ultimo_mensaje ?? String(result.message.contenido ?? ''),
      ultimoMensajeFecha: result.message.fecha_creacion,
    });

    return {
      ok: true,
      conversacion_id: conversationId,
      message: result.message,
    };
  }

  @SubscribeMessage('chat:mark-read')
  async markRead(
    @ConnectedSocket() client: SocketWithUser,
    @MessageBody() payload: { conversacion_id: string },
  ) {
    const user = client.data.user;
    if (!user) {
      throw new UnauthorizedException('Usuario no autenticado');
    }
    this.ensureChatRole(user.id_rol);

    await this.chatService.markAsRead(payload.conversacion_id, user.sub, user.id_rol);

    const conversation = await this.chatService.assertConversationAccess(payload.conversacion_id, user.sub, user.id_rol);
    this.emitReadUpdated({
      conversationId: String(conversation._id),
      readerId: user.sub,
      readerRole: user.id_rol === 1 ? 'admin' : 'cliente',
    });

    return { ok: true };
  }
}
