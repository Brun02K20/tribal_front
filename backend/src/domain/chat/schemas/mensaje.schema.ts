import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type MensajeDocument = HydratedDocument<Mensaje>;

@Schema({ collection: 'mensajes', versionKey: false })
export class Mensaje {
  @Prop({ type: Types.ObjectId, required: true, index: true })
  declare conversacion_id: Types.ObjectId;

  @Prop({ required: true, index: true })
  declare autor_id: number;

  @Prop({ required: true, enum: ['cliente', 'admin'] })
  declare rol: 'cliente' | 'admin';

  @Prop({ required: true, default: Date.now })
  declare fecha_creacion: Date;

  @Prop({ required: true, trim: true })
  declare contenido: string;

  @Prop({ required: true, default: false })
  declare leido: boolean;
}

export const MensajeSchema = SchemaFactory.createForClass(Mensaje);
