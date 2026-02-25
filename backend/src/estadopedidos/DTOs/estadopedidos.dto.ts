import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsString } from 'class-validator';

export class CreateEstadoPedidoDto {
  @ApiProperty({ example: 'Macramé' })
  @IsString()
  nombre!: string;
}

export class SuccessDeleteEstadoPedidoDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  id!: number;

  @ApiProperty({ example: 'EstadoPedido deleted successfully' })
  @IsString()
  message!: string;
}

export class EstadoPedidoResponseDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  id!: number;

  @ApiProperty({ example: 'Macramé' })
  @IsString()
  nombre!: string;

  @ApiProperty({ example: true })
  @IsBoolean()
  esActivo!: boolean;
}