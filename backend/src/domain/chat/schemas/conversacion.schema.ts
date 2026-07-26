import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ConversacionDocument = HydratedDocument<Conversacion>;

@Schema({ collection: 'conversaciones', versionKey: false })
export class Conversacion {
  @Prop({ required: true, index: true, unique: true })
  declare cliente_id: number;

  @Prop()
  declare visitante_id?: string;

  @Prop({ index: true })
  declare ip_hash?: string;

  @Prop({ required: true, default: false })
  declare es_visitante: boolean;

  @Prop({ required: true, default: Date.now })
  declare fecha_creacion: Date;

  @Prop({ default: '' })
  declare ultimo_mensaje: string;
}

export const ConversacionSchema = SchemaFactory.createForClass(Conversacion);
