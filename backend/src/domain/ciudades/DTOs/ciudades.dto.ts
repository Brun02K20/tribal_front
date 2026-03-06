import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString } from 'class-validator';

export class CiudadDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  id!: number;

  @ApiProperty({ example: 'Colonia Caroya' })
  @IsString()
  nombre!: string;

  @ApiProperty({ example: 1 })
  @IsInt()
  id_provincia!: number;
}
