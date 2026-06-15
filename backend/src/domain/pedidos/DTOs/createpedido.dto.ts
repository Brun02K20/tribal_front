import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsInt, IsDecimal, IsOptional, IsString } from 'class-validator';
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

    @ApiProperty({
        example: ['https://tribaltrend.com.ar/files/products/1/diseno-1.jpg'],
        required: false,
        nullable: true,
        type: [String],
    })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    disenos_urls?: string[] | null;
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

    // Agregar al final de CreatePedidoDto, antes del cierre de la clase:
    @ApiProperty({ example: 'D', description: 'Tipo de entrega CA: D=domicilio, S=sucursal', required: false })
    @IsOptional()
    @IsString()
    ca_delivered_type?: string;

    @ApiProperty({ example: 'CP', description: 'Tipo de producto CA', required: false })
    @IsOptional()
    @IsString()
    ca_product_type?: string;

    @ApiProperty({ example: 'Correo Argentino Clasico', required: false })
    @IsOptional()
    @IsString()
    ca_product_name?: string;

    @ApiProperty({ example: 498.06, description: 'Precio cotizado por CA', required: false })
    @IsOptional()
    ca_price?: number;
}

