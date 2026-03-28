import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsString } from 'class-validator';

export class CreateEstadoEncargoDto {
  @ApiProperty({ example: 'Solicitado' })
  @IsString()
  nombre!: string;
}

export class SuccessDeleteEstadoEncargoDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  id!: number;

  @ApiProperty({ example: 'EstadoEncargo deleted successfully' })
  @IsString()
  message!: string;
}

export class EstadoEncargoResponseDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  id!: number;

  @ApiProperty({ example: 'Solicitado' })
  @IsString()
  nombre!: string;

  @ApiProperty({ example: true })
  @IsBoolean()
  esActivo!: boolean;
}
