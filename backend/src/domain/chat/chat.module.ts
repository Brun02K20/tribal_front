import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from 'src/auth/auth.module';
import { ChatController } from './chat.controller';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { Conversacion, ConversacionSchema } from './schemas/conversacion.schema';
import { Mensaje, MensajeSchema } from './schemas/mensaje.schema';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      { name: Conversacion.name, schema: ConversacionSchema },
      { name: Mensaje.name, schema: MensajeSchema },
    ]),
  ],
  controllers: [ChatController],
  providers: [ChatService, ChatGateway],
  exports: [ChatService],
})
export class ChatModule {}
