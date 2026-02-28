import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsString, IsDecimal } from 'class-validator';
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

export class ListDetallePedidoCreateDto {
    @ApiProperty({ type: [DetallePedidoCreateDto] })
    detalles!: DetallePedidoCreateDto[];
}

export class CreatePedidoDto {
    @ApiProperty({ example: 1 })
    @IsInt()
    id_usuario!: number;

    @ApiProperty({ example: 1 })
    @IsDecimal()
    costo_total_productos!: number;

    @ApiProperty({ example: 1 })
    @IsDecimal()
    costo_envio!: number;

    @ApiProperty({ example: 1 })
    @IsDecimal()
    costo_ganancia_envio!: number;

    @ApiProperty({type: ListDetallePedidoCreateDto})
    detalles!: DetallePedidoCreateDto[];

    @ApiProperty({ example: 1 })
    @IsInt()
    id_direccion!: number;
}

