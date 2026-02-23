import { ApiProperty } from '@nestjs/swagger';

export class ProvinciaDto {
  @ApiProperty({ example: 1 })
  id: number = 0;

  @ApiProperty({ example: 'Buenos Aires' })
  nombre: string = '';
}
