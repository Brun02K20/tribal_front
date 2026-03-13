import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsDecimal, IsOptional, IsString } from 'class-validator';
export class DetallePedidoCreateDto {
    @ApiProperty({ example: 1 })
    @IsInt()
    id_producto!: number;

    @ApiProperty({ example: 2 })
    @IsInt()
    unidades!: number;

    @ApiProperty({ example: 19.99 })
    @IsDecimal()
    subtotal!: number;

    @ApiProperty({ example: 12, required: false, nullable: true })
    @IsOptional()
    @IsInt()
    id_descuento?: number;

    @ApiProperty({ example: 2 })
    @IsInt()
    ancho_producto!: number;

    @ApiProperty({ example: 3 })
    @IsInt()
    alto_producto!: number;

    @ApiProperty({ example: 4 })
    @IsInt()
    profundo_producto!: number;
}

export class CreatePedidoDto {
    @ApiProperty({ example: 13 })
    @IsInt()
    id_usuario!: number;

    @ApiProperty({ example: 19.97 })
    @IsDecimal()
    costo_total_productos!: number;

    @ApiProperty({ example: 10 })
    @IsDecimal()
    costo_envio!: number;

    @ApiProperty({ example: 5 })
    @IsDecimal()
    costo_ganancia_envio!: number;

    @ApiProperty({
        example: 'Entregar por la tarde. Portero eléctrico no funciona.',
        required: false,
        nullable: true,
    })
    @IsOptional()
    @IsString()
    observaciones?: string | null;

    @ApiProperty({ type: [DetallePedidoCreateDto] })
    detalles!: DetallePedidoCreateDto[];

    @ApiProperty({ example: 1 })
    @IsInt()
    id_direccion!: number;
}

