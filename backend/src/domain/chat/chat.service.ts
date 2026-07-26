import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Conversacion } from './schemas/conversacion.schema';
import { Mensaje } from './schemas/mensaje.schema';
import { Usuarios } from 'src/auth/models/Usuarios';
import { ClientChatIdentity, SendMessageInput } from './types/chat.types';
import { findSuspiciousInputPaths } from 'src/utils/security/xss-detector';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(Conversacion.name)
    private readonly conversacionModel: Model<Conversacion>,
    @InjectModel(Mensaje.name)
    private readonly mensajeModel: Model<Mensaje>,
  ) {}

  private sanitizeContenido(contenido: string): string {
    const clean = String(contenido ?? '').trim();
    if (!clean) {
      throw new BadRequestException('El contenido del mensaje es obligatorio');
    }

    if (clean.length > 2000) {
      throw new BadRequestException('El contenido del mensaje excede el máximo permitido (2000)');
    }

    const suspicious = findSuspiciousInputPaths({ contenido: clean }, 'chat');
    if (suspicious.length) {
      throw new BadRequestException(
        `Entrada rechazada por seguridad. Campos sospechosos: ${suspicious.join(', ')}`,
      );
    }

    return clean;
  }

  private ensureObjectId(id: string): Types.ObjectId {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('ID de conversación inválido');
    }

    return new Types.ObjectId(id);
  }

  private async enrichConversationsWithClientName<T extends { cliente_id?: number }>(conversaciones: T[]) {
    const uniqueClientIds = [...new Set(
      conversaciones
        .map((conv) => Number(conv.cliente_id))
        .filter((id) => Number.isInteger(id) && id > 0),
    )];
    const users = await Promise.all(uniqueClientIds.map((id) => Usuarios.findByPk(id)));
    const nameMap = new Map<number, string>();

    users.forEach((user) => {
      if (user) {
        nameMap.set(Number(user.id), user.nombre);
      }
    });

    return conversaciones.map((conv) => ({
      ...conv,
      cliente_nombre: conv.cliente_id && conv.cliente_id > 0
        ? nameMap.get(Number(conv.cliente_id)) ?? `Cliente #${conv.cliente_id}`
        : 'Visitante',
    }));
  }

  private async getClientNameById(clienteId: number): Promise<string> {
    const user = await Usuarios.findByPk(clienteId);
    return user?.nombre ?? `Cliente #${clienteId}`;
  }

  async getOrCreateConversationForClient(clienteId: number) {
    if (!Number.isInteger(clienteId) || clienteId < 1) {
      throw new BadRequestException('ID de cliente inválido para crear conversación');
    }

    const conversation = await this.conversacionModel
      .findOneAndUpdate(
        { cliente_id: clienteId },
        {
          $setOnInsert: {
            cliente_id: clienteId,
            fecha_creacion: new Date(),
            ultimo_mensaje: '',
          },
        },
        {
          upsert: true,
          new: true,
          setDefaultsOnInsert: true,
        },
      )
      .lean();

    if (!conversation) {
      throw new BadRequestException('No se pudo obtener ni crear la conversación del cliente');
    }

    return conversation;
  }

  async getOrCreateConversationForIdentity(identity: ClientChatIdentity) {
    const userConversation = identity.clienteId
      ? await this.conversacionModel.findOne({ cliente_id: identity.clienteId })
      : null;
    // The long-lived visitor cookie is more precise; the IP hash is only a
    // recovery fallback when that cookie is no longer available.
    const conversationByVisitor = await this.conversacionModel.findOne({
      visitante_id: identity.visitanteId,
      es_visitante: true,
    });
    const anonymousConversation = conversationByVisitor ?? await this.conversacionModel
      .findOne({ ip_hash: identity.ipHash, es_visitante: true })
      .sort({ fecha_creacion: -1 });

    if (userConversation && anonymousConversation && !userConversation._id.equals(anonymousConversation._id)) {
      await this.mensajeModel.updateMany(
        { conversacion_id: anonymousConversation._id },
        { $set: { conversacion_id: userConversation._id } },
      );
      if (anonymousConversation.ultimo_mensaje) {
        userConversation.ultimo_mensaje = anonymousConversation.ultimo_mensaje;
        await userConversation.save();
      }
      await anonymousConversation.deleteOne();
    }

    if (userConversation) {
      userConversation.visitante_id = identity.visitanteId;
      userConversation.ip_hash = identity.ipHash;
      await userConversation.save();
      return userConversation.toObject();
    }

    if (anonymousConversation) {
      if (identity.clienteId) {
        anonymousConversation.cliente_id = identity.clienteId;
        anonymousConversation.es_visitante = false;
      }
      anonymousConversation.visitante_id = identity.visitanteId;
      anonymousConversation.ip_hash = identity.ipHash;
      await anonymousConversation.save();
      return anonymousConversation.toObject();
    }

    const anonymousNumericId = -Number.parseInt(identity.visitanteId.slice(0, 12), 16);
    return this.conversacionModel.create({
      cliente_id: identity.clienteId ?? anonymousNumericId,
      visitante_id: identity.visitanteId,
      ip_hash: identity.ipHash,
      es_visitante: !identity.clienteId,
      fecha_creacion: new Date(),
      ultimo_mensaje: '',
    }).then((conversation) => conversation.toObject());
  }

  async getConversationForIdentityWithMessages(identity: ClientChatIdentity) {
    const conversation = await this.getOrCreateConversationForIdentity(identity);
    const messages = await this.mensajeModel
      .find({ conversacion_id: conversation._id })
      .sort({ fecha_creacion: 1 })
      .lean();
    return { conversation, messages };
  }

  async assertConversationAccessForIdentity(
    conversacionId: string,
    identity: ClientChatIdentity,
  ) {
    const conversation = await this.getOrCreateConversationForIdentity(identity);
    if (String(conversation._id) !== conversacionId) {
      throw new ForbiddenException('No tenés permisos para acceder a esta conversación');
    }
    return conversation;
  }

  async markAsReadForIdentity(
    conversacionId: string,
    identity: ClientChatIdentity,
  ) {
    const conversation = await this.assertConversationAccessForIdentity(conversacionId, identity);
    await this.mensajeModel.updateMany(
      { conversacion_id: conversation._id, rol: 'admin', leido: false },
      { $set: { leido: true } },
    );
    return { ok: true };
  }

  async sendClientMessage(identity: ClientChatIdentity, contenidoInput: string) {
    const contenido = this.sanitizeContenido(contenidoInput);
    const conversation = await this.getOrCreateConversationForIdentity(identity);
    const created = await this.mensajeModel.create({
      conversacion_id: conversation._id,
      autor_id: identity.clienteId ?? 0,
      rol: 'cliente',
      fecha_creacion: new Date(),
      contenido,
      leido: false,
    });
    await this.conversacionModel.updateOne(
      { _id: conversation._id },
      { $set: { ultimo_mensaje: contenido } },
    );
    return {
      conversation: {
        ...conversation,
        cliente_nombre: identity.clienteId
          ? await this.getClientNameById(identity.clienteId)
          : 'Visitante',
        ultimo_mensaje: contenido,
      },
      message: created.toObject(),
    };
  }

  async assertConversationAccess(conversacionId: string, userId: number, userRole: number) {
    const objectId = this.ensureObjectId(conversacionId);
    const conversacion = await this.conversacionModel.findById(objectId).lean();

    if (!conversacion) {
      throw new NotFoundException('No existe la conversación indicada');
    }

    if (userRole !== 1 && Number(conversacion.cliente_id) !== Number(userId)) {
      throw new ForbiddenException('No tenés permisos para acceder a esta conversación');
    }

    return conversacion;
  }

  async listConversationsForAdmin() {
    const conversations = await this.conversacionModel
      .find({})
      .lean();

    const enriched = await Promise.all(
      conversations.map(async (conversation) => {
        const unreadCount = await this.mensajeModel.countDocuments({
          conversacion_id: conversation._id,
          rol: 'cliente',
          leido: false,
        });

        const lastMessage = await this.mensajeModel
          .findOne({ conversacion_id: conversation._id })
          .sort({ fecha_creacion: -1 })
          .lean();

        return {
          ...conversation,
          ultimo_mensaje: lastMessage?.contenido ?? conversation.ultimo_mensaje ?? '',
          ultimo_mensaje_fecha: lastMessage?.fecha_creacion ?? conversation.fecha_creacion,
          no_leidos: unreadCount,
        };
      }),
    );

    const sortedByLastMessage = enriched.sort((a, b) => {
      const dateA = new Date(a.ultimo_mensaje_fecha ?? a.fecha_creacion).getTime();
      const dateB = new Date(b.ultimo_mensaje_fecha ?? b.fecha_creacion).getTime();
      return dateB - dateA;
    });

    return this.enrichConversationsWithClientName(sortedByLastMessage);
  }

  async getOwnConversationWithMessages(clienteId: number) {
    const conversation = await this.getOrCreateConversationForClient(clienteId);
    const messages = await this.mensajeModel
      .find({ conversacion_id: conversation._id })
      .sort({ fecha_creacion: 1 })
      .lean();

    return {
      conversation,
      messages,
    };
  }

  async getMessagesByConversation(conversacionId: string, userId: number, userRole: number) {
    await this.assertConversationAccess(conversacionId, userId, userRole);
    const objectId = this.ensureObjectId(conversacionId);

    const messages = await this.mensajeModel
      .find({ conversacion_id: objectId })
      .sort({ fecha_creacion: 1 })
      .lean();

    return messages;
  }

  async markAsRead(conversacionId: string, userId: number, userRole: number) {
    await this.assertConversationAccess(conversacionId, userId, userRole);
    const objectId = this.ensureObjectId(conversacionId);

    const senderRoleToMark = userRole === 1 ? 'cliente' : 'admin';
    await this.mensajeModel.updateMany(
      {
        conversacion_id: objectId,
        rol: senderRoleToMark,
        leido: false,
      },
      {
        $set: { leido: true },
      },
    );

    return { ok: true };
  }

  async sendMessage(input: SendMessageInput) {
    const contenido = this.sanitizeContenido(input.contenido);
    const isAdmin = input.rol === 'admin';

    let conversation;
    if (isAdmin) {
      if (!input.conversacion_id) {
        throw new BadRequestException('Para responder como admin debe indicar conversacion_id');
      }
      conversation = await this.assertConversationAccess(input.conversacion_id, input.autor_id, 1);
    } else {
      conversation = await this.getOrCreateConversationForClient(input.autor_id);
    }

    const created = await this.mensajeModel.create({
      conversacion_id: conversation._id,
      autor_id: input.autor_id,
      rol: input.rol,
      fecha_creacion: new Date(),
      contenido,
      leido: false,
    });

    await this.conversacionModel.updateOne(
      { _id: conversation._id },
      {
        $set: {
          ultimo_mensaje: contenido,
        },
      },
    );

    const createdMessage = created.toObject();
    const updatedConversation = await this.conversacionModel.findById(conversation._id).lean();
    const clientId = Number(updatedConversation?.cliente_id ?? conversation.cliente_id);
    const clientName = Number.isFinite(clientId) ? await this.getClientNameById(clientId) : 'Cliente';

    return {
      conversation: updatedConversation
        ? {
            ...updatedConversation,
            cliente_nombre: clientName,
          }
        : updatedConversation,
      message: createdMessage,
    };
  }
}
