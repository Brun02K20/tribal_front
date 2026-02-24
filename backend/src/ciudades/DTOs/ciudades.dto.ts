import { ApiProperty } from '@nestjs/swagger';

export class CiudadDto {
  @ApiProperty({ example: 1 })
  id: number = 0;

  @ApiProperty({ example: 'Colonia Caroya' })
  nombre: string = '';

  @ApiProperty({ example: 1 })
  id_provincia: number = 0;
}
