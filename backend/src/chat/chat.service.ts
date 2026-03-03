import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Conversacion } from './schemas/conversacion.schema';
import { Mensaje } from './schemas/mensaje.schema';
import { Usuarios } from 'src/auth/models/Usuarios';
import { SendMessageInput } from './types/chat.types';

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

    return clean;
  }

  private ensureObjectId(id: string): Types.ObjectId {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('ID de conversación inválido');
    }

    return new Types.ObjectId(id);
  }

  private async enrichConversationsWithClientName<T extends { cliente_id: number }>(conversaciones: T[]) {
    const uniqueClientIds = [...new Set(conversaciones.map((conv) => Number(conv.cliente_id)).filter((id) => Number.isFinite(id)))];
    const users = await Promise.all(uniqueClientIds.map((id) => Usuarios.findByPk(id)));
    const nameMap = new Map<number, string>();

    users.forEach((user) => {
      if (user) {
        nameMap.set(Number(user.id), user.nombre);
      }
    });

    return conversaciones.map((conv) => ({
      ...conv,
      cliente_nombre: nameMap.get(Number(conv.cliente_id)) ?? `Cliente #${conv.cliente_id}`,
    }));
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

    return {
      conversation: updatedConversation,
      message: createdMessage,
    };
  }
}
