import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsDecimal, IsString, IsNumber } from 'class-validator';



export class DescuentoAplicadoProductoDto {
    @ApiProperty({ example: 1 })
    @IsInt()
    id_descuento!: number;

    @ApiProperty({ example: 15 })
    @IsNumber()
    porcentaje!: number;

    @ApiProperty({ example: 'producto' })
    @IsString()
    tipo!: 'producto' | 'subcategoria' | 'categoria';
}

export class GetProductDto {
    @ApiProperty({ example: 1 })
    @IsInt()
    id!: number;

    @ApiProperty({ example: 'Macramé' })
    @IsString()
    nombre!: string;

    @ApiProperty({ example: 'Descripción del producto' })
    @IsString()
    descripcion!: string;

    @ApiProperty({ example: 99.99 })
    @IsDecimal()
    precio!: number;

    @ApiProperty({ example: 84.99, required: false })
    @IsDecimal()
    precio_final?: number;

    @ApiProperty({ example: 10 })
    @IsInt()
    stock!: number;

    @ApiProperty({ example: { id: 1, nombre: 'Categoría 1' } })
    categoria!: { id: number; nombre: string };

    @ApiProperty({ example: { id: 1, nombre: 'Subcategoría 1' } })
    subcategoria!: { id: number; nombre: string };

    @ApiProperty({ example: 1 })
    @IsInt()
    ancho!: number;

    @ApiProperty({ example: 1 })
    @IsInt()
    alto!: number;

    @ApiProperty({ example: 1 })
    @IsInt()
    profundo!: number;

    @ApiProperty({ example: 1 })
    @IsInt()
    peso_gramos!: number;

    @ApiProperty({ example: true })
    @IsBoolean()
    es_activo!: boolean;

    @ApiProperty({ example: [
        {
            id: 1,
            url: 'https://example.com/foto1.jpg'
        },
        {  
            id: 2,
            url: 'https://example.com/foto2.jpg'
        }
    ] })
    fotos!: GetFotoDto[];

    @ApiProperty({ required: false, type: DescuentoAplicadoProductoDto })
    descuento_aplicado?: DescuentoAplicadoProductoDto;
}


export class GetFotoDto {
    @ApiProperty({ example: 1 })
    @IsInt()
    id!: number;

    @ApiProperty({ example: 'https://example.com/foto.jpg' })
    @IsString()
    url!: string;

    @ApiProperty({ example: 1 })
    @IsInt()
    id_producto!: number;
}

export class CreateUpdateProductDto {
    @ApiProperty({ example: 'Macramé' })
    @IsString()
    nombre!: string;

    @ApiProperty({ example: 'Descripción del producto' })
    @IsString()
    descripcion!: string;

    @ApiProperty({ example: 99.99 })
    @IsDecimal()
    precio!: number;

    @ApiProperty({ example: 10 })
    @IsInt()
    stock!: number;

    @ApiProperty({ example: 1 })
    @IsInt()
    id_categoria!: number;

    @ApiProperty({ example: 1 })
    @IsInt()
    id_subcategoria!: number;

    @ApiProperty({ example: 1 })
    @IsInt()
    ancho!: number;

    @ApiProperty({ example: 1 })
    @IsInt()
    alto!: number;

    @ApiProperty({ example: 1 })
    @IsInt()
    profundo!: number;

    @ApiProperty({ example: 1 })
    @IsInt()
    peso_gramos!: number;
}

export class SuccessDeleteProductDto {
    @ApiProperty({ example: 1 })
    @IsInt()
    id!: number;

    @ApiProperty({ example: 'Producto eliminado exitosamente' })
    message!: string;
}

export class ProductFiltersDto {
    @ApiProperty({ example: 1, required: false })
    id_categoria?: number;

    @ApiProperty({ example: 1, required: false })
    id_subcategoria?: number;

    @ApiProperty({ example: 'Macramé', required: false })
    nombre?: string;

    @ApiProperty({ example: 30.00, required: false })
    precio_min?: number;

    @ApiProperty({ example: 100.00, required: false })
    precio_max?: number;
}

export class PaginatedProductsResponseDto<T> {
    @ApiProperty({ example: 1 })
    page!: number;

    @ApiProperty({ example: 18 })
    pageSize!: number;

    @ApiProperty({ example: 280 })
    totalItems!: number;

    @ApiProperty({ example: 16 })
    totalPages!: number;

    data!: T[];
}

export class PaginatedProductsListResponseDto {
    @ApiProperty({ example: 1 })
    page!: number;

    @ApiProperty({ example: 18 })
    pageSize!: number;

    @ApiProperty({ example: 280 })
    totalItems!: number;

    @ApiProperty({ example: 16 })
    totalPages!: number;

    @ApiProperty({ type: GetProductDto, isArray: true })
    data!: GetProductDto[];
}