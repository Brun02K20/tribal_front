import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsString } from 'class-validator';

export class CreateEstadoEnvioDto {
  @ApiProperty({ example: 'Entregado' })
  @IsString()
  nombre!: string;
}

export class SuccessDeleteEstadoEnvioDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  id!: number;

  @ApiProperty({ example: 'EstadoEnvio deleted successfully' })
  @IsString()
  message!: string;
}

export class EstadoEnvioResponseDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  id!: number;

  @ApiProperty({ example: 'En transporte' })
  @IsString()
  nombre!: string;

  @ApiProperty({ example: true })
  @IsBoolean()
  esActivo!: boolean;
}