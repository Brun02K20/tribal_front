import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsString } from 'class-validator';

export class SubcategoriaResponseDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  id!: number;

  @ApiProperty({ example: 'Deco' })
  @IsString()
  nombre!: string;

    @ApiProperty({ example: 1 })
    @IsInt()
    id_categoria!: number;

    @ApiProperty({ example: true })
    @IsBoolean()
    esActivo!: boolean;
};


export class CreateSubcategoriaDto {
  @ApiProperty({ example: 'Deco' })
  @IsString()
  nombre!: string;

  @ApiProperty({ example: 1 })
  @IsInt()
  id_categoria!: number;
}

export class SuccessDeleteSubcategoriaDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  id!: number;

  @ApiProperty({ example: 'Subcategoria deleted successfully' })
  @IsString()
  message!: string;
}

