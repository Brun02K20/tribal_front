import { ApiProperty } from '@nestjs/swagger';

export class AiAdminSummaryResponseDto {
  @ApiProperty({
    example: [
      'Se registraron 8 pedidos nuevos en los últimos 3 días, con mayor concentración en estado Aprobado.',
      'Hay 5 productos con stock bajo, incluyendo Hilo Macramé y Aguja Circular.',
    ],
  })
  ocurrio!: string[];

  @ApiProperty({
    example: [
      'Aumentar stock de Hilo Macramé para evitar quiebres en los próximos días.',
      'Contactar a María Gómez (maria@mail.com, +54 9 11 5555-0001) para asistir su primera compra.',
    ],
  })
  acciones!: string[];

  @ApiProperty({ example: '2026-03-01T14:22:00.000Z' })
  generadoEn!: string;

  @ApiProperty({ example: 3 })
  rangoDias!: number;
}
