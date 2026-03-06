import { ApiProperty } from '@nestjs/swagger';

export class CreateResenaDto {
  @ApiProperty({ example: 5, description: 'Calificación del 1 al 5' })
  calificacion!: number;
}

export class ResenaUsuarioDto {
  @ApiProperty({ example: 21 })
  id!: number;

  @ApiProperty({ example: 'Juan Pérez' })
  nombre!: string;

  @ApiProperty({ example: 'juanperez' })
  username!: string;
}

export class ResenaItemDto {
  @ApiProperty({ example: 10 })
  id!: number;

  @ApiProperty({ example: 3 })
  id_producto!: number;

  @ApiProperty({ example: 21 })
  id_usuario!: number;

  @ApiProperty({ example: 4 })
  calificacion!: number;

  @ApiProperty({ example: '2026-03-01T10:30:00.000Z' })
  fecha!: string;

  @ApiProperty({ example: true })
  es_activo!: boolean;

  @ApiProperty({ type: ResenaUsuarioDto })
  usuario!: ResenaUsuarioDto;
}

export class ResenaDistribucionItemDto {
  @ApiProperty({ example: 5 })
  calificacion!: number;

  @ApiProperty({ example: 12 })
  cantidad!: number;
}

export class ResenasProductoResponseDto {
  @ApiProperty({ example: 4.8 })
  promedio!: number;

  @ApiProperty({ example: 782 })
  totalCalificaciones!: number;

  @ApiProperty({ type: ResenaDistribucionItemDto, isArray: true })
  distribucion!: ResenaDistribucionItemDto[];

  @ApiProperty({ type: ResenaItemDto, isArray: true })
  resenas!: ResenaItemDto[];
}
