import { ApiProperty } from '@nestjs/swagger';
import { IsDecimal, IsInt, IsOptional, IsString } from 'class-validator';

export class GetDisenoDto {
    @ApiProperty({ example: 1 })
    @IsInt()
    id!: number;

    @ApiProperty({ example: 'Diseño mandala azul' })
    @IsString()
    nombre!: string;

    @ApiProperty({ example: 12500 })
    @IsDecimal()
    precio!: number;

    @ApiProperty({ example: 4 })
    @IsInt()
    stock!: number;

    @ApiProperty({ example: 'https://tribaltrend.com.ar/files/products/1/diseno.jpg', nullable: true })
    @IsOptional()
    @IsString()
    url_foto!: string | null;

    @ApiProperty({ example: 1 })
    @IsInt()
    id_producto!: number;
}

export class CreateUpdateDisenoDto {
    @ApiProperty({ example: 'Diseño mandala azul' })
    @IsString()
    nombre!: string;

    @ApiProperty({ example: 12500 })
    @IsDecimal()
    precio!: number;

    @ApiProperty({ example: 4 })
    @IsInt()
    stock!: number;
}
