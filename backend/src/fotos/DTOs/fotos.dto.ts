import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsDecimal, IsString } from 'class-validator';

export class CreateProductFotosDto {
    @ApiProperty({ example: 'https://example.com/foto1.jpg' })
    @IsString()
    url!: string;

    @ApiProperty({ example: 1, required: true })
    @IsInt()
    id_producto!: number;
}