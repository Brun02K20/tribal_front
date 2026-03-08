import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateDescuentoDto {
  @ApiProperty({ example: 15 })
  @IsNumber()
  @Min(0.01)
  @Max(100)
  porcentaje!: number;

  @ApiProperty({ example: 10, required: false })
  @IsOptional()
  @IsInt()
  id_producto?: number;

  @ApiProperty({ example: 4, required: false })
  @IsOptional()
  @IsInt()
  id_subcategoria?: number;

  @ApiProperty({ example: 2, required: false })
  @IsOptional()
  @IsInt()
  id_categoria?: number;

  @ApiProperty({ example: '2026-03-08T00:00:00.000Z' })
  @IsString()
  fecha_inicio!: string;

  @ApiProperty({ example: '2026-03-20T23:59:59.000Z' })
  @IsString()
  fecha_fin!: string;
}

export class UpdateDescuentoDto extends CreateDescuentoDto {}

export class ReferenciaSimpleDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  id!: number;

  @ApiProperty({ example: 'Mates' })
  @IsString()
  nombre!: string;
}

export class DescuentoResponseDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  id!: number;

  @ApiProperty({ example: 15 })
  @IsNumber()
  porcentaje!: number;

  @ApiProperty({ example: 10, nullable: true })
  id_producto!: number | null;

  @ApiProperty({ example: 4, nullable: true })
  id_subcategoria!: number | null;

  @ApiProperty({ example: 2, nullable: true })
  id_categoria!: number | null;

  @ApiProperty({ example: '2026-03-08T00:00:00.000Z' })
  @IsString()
  fecha_inicio!: string;

  @ApiProperty({ example: '2026-03-20T23:59:59.000Z' })
  @IsString()
  fecha_fin!: string;

  @ApiProperty({ example: 'producto' })
  @IsString()
  tipo!: 'producto' | 'subcategoria' | 'categoria';

  @ApiProperty({ example: 'vigente' })
  @IsString()
  estado!: 'no_empezado' | 'vigente' | 'terminado';

  @ApiProperty({ required: false, nullable: true, type: ReferenciaSimpleDto })
  producto!: ReferenciaSimpleDto | null;

  @ApiProperty({ required: false, nullable: true, type: ReferenciaSimpleDto })
  subcategoria!: ReferenciaSimpleDto | null;

  @ApiProperty({ required: false, nullable: true, type: ReferenciaSimpleDto })
  categoria!: ReferenciaSimpleDto | null;
}

export class SuccessDeleteDescuentoDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  id!: number;

  @ApiProperty({ example: 'Descuento eliminado exitosamente' })
  @IsString()
  message!: string;
}
