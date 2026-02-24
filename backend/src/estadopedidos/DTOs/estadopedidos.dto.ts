import { ApiProperty } from '@nestjs/swagger';

export class CreateEstadoPedidoDto {
  @ApiProperty({ example: 'Macramé' })
  nombre: string = '';
}

export class SuccessDeleteEstadoPedidoDto {
  @ApiProperty({ example: 1 })
  id: number = 0;

  @ApiProperty({ example: 'EstadoPedido deleted successfully' })
  message: string = '';
}

export class EstadoPedidoResponseDto {
  @ApiProperty({ example: 1 })
  id: number = 0;

  @ApiProperty({ example: 'Macramé' })
  nombre: string = '';

  @ApiProperty({ example: true })
  esActivo: boolean = false;
}