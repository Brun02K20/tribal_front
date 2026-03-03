import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SendMessageDto {
  @ApiPropertyOptional({
    description: 'ID de la conversación (requerido para admin, opcional para cliente)',
    example: '65f8b2e41e6b77f2a1b2c3d4',
  })
  conversacion_id?: string;

  @ApiProperty({
    description: 'Contenido textual del mensaje',
    example: 'Hola, necesito ayuda con mi pedido',
  })
  declare contenido: string;
}
