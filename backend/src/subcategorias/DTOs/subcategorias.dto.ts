import { ApiProperty } from '@nestjs/swagger';

export class SubcategoriaResponseDto {
  @ApiProperty({ example: 1 })
  id: number = 0;

  @ApiProperty({ example: 'Deco' })
  nombre: string = '';

    @ApiProperty({ example: 1 })
    id_categoria: number = 0;

    @ApiProperty({ example: true })
    esActivo: boolean = false;
};


export class CreateSubcategoriaDto {
  @ApiProperty({ example: 'Deco' })
  nombre: string = '';

  @ApiProperty({ example: 1 })
  id_categoria: number = 0;
}

export class SuccessDeleteSubcategoriaDto {
  @ApiProperty({ example: 1 })
  id: number = 0;

  @ApiProperty({ example: 'Subcategoria deleted successfully' })
  message: string = '';
}

