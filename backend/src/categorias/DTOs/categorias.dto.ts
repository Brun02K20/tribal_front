import { ApiProperty } from '@nestjs/swagger';
import type { SubcategoriaListResponse, SubcategoriaResponse } from 'src/subcategorias/types/subcategorias.types';

export class CreateCategoriaDto {
  @ApiProperty({ example: 'Macramé' })
  nombre: string = '';
}

export class SuccessDeleteCategoriaDto {
  @ApiProperty({ example: 1 })
  id: number = 0;

  @ApiProperty({ example: 'Categoria deleted successfully' })
  message: string = '';
}

export class CategoriaResponseDto {
  @ApiProperty({ example: 1 })
  id: number = 0;

  @ApiProperty({ example: 'Macramé' })
  nombre: string = '';

  @ApiProperty({ example: true })
  esActivo: boolean = false;

  @ApiProperty({ example: [] })
  subcategorias: SubcategoriaListResponse = [];
}