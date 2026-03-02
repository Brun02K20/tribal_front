import { ApiProperty } from '@nestjs/swagger';
import { DetallePedidoResponseDto } from './getpedido.dto';

export class FindPedidosFiltersDto {
  @ApiProperty({ required: false, example: 13 })
  id_usuario?: number;

  @ApiProperty({ required: false, example: 'Bruno' })
  nombre_usuario?: string;

  @ApiProperty({ required: false, example: 'bruno@mail.com' })
  email_usuario?: string;

  @ApiProperty({ required: false, example: '2026-01-01' })
  fecha_pedido_min?: string;

  @ApiProperty({ required: false, example: '2026-12-31' })
  fecha_pedido_max?: string;

  @ApiProperty({ required: false, example: 2 })
  id_estado_pedido?: number;

  @ApiProperty({ required: false, example: 3 })
  id_estado_envio?: number;
}

export class PaginatedPedidosResponseDto<T> {
  @ApiProperty({ example: 1 })
  page!: number;

  @ApiProperty({ example: 10 })
  pageSize!: number;

  @ApiProperty({ example: 125 })
  totalItems!: number;

  @ApiProperty({ example: 13 })
  totalPages!: number;

  data!: T[];
}

export class PaginatedPedidosListResponseDto {
  @ApiProperty({ example: 1 })
  page!: number;

  @ApiProperty({ example: 10 })
  pageSize!: number;

  @ApiProperty({ example: 125 })
  totalItems!: number;

  @ApiProperty({ example: 13 })
  totalPages!: number;

  @ApiProperty({ type: DetallePedidoResponseDto, isArray: true })
  data!: DetallePedidoResponseDto[];
}
