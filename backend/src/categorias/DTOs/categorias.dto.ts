import { ApiProperty } from '@nestjs/swagger';
import type { SubcategoriaListResponse, SubcategoriaResponse } from 'src/subcategorias/types/subcategorias.types';
import { IsArray, IsBoolean, IsInt, IsString } from 'class-validator';

export class CreateCategoriaDto {
  @ApiProperty({ example: 'Macramé' })
  @IsString()
  nombre!: string;
}

export class SuccessDeleteCategoriaDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  id!: number;

  @ApiProperty({ example: 'Categoria deleted successfully' })
  @IsString()
  message!: string;
}

export class CategoriaResponseDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  id!: number;

  @ApiProperty({ example: 'Macramé' })
  @IsString()
  nombre!: string;

  @ApiProperty({ example: true })
  @IsBoolean()
  esActivo!: boolean;

  @ApiProperty({ example: [
    {
      id: 1,
      nombre: 'Deco',
      id_categoria: 1,
      esActivo: true
    }
  ] })
  @IsArray()
  subcategorias!: SubcategoriaListResponse;
}