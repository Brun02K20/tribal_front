import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsString, IsDecimal } from 'class-validator';

export class DetalleItemPedidoDto {
    @ApiProperty({ example: 1 })
    @IsInt()
    id!: number;

    @ApiProperty({ example: 1 })
    @IsInt()
    id_producto!: number;

    @ApiProperty({ example: 12, required: false, nullable: true })
    id_descuento!: number | null;

    @ApiProperty({ example: 10, required: false, nullable: true })
    porcentaje_descuento!: number | null;

    @ApiProperty({ example: 'Mate Camionero' })
    @IsString()
    nombre_producto!: string;

    @ApiProperty({ example: 2 })
    @IsInt()
    unidades!: number;

    @ApiProperty({ example: 15999.99 })
    subtotal!: number;

    @ApiProperty({ example: 7999.99 })
    precio_unitario!: number;

    @ApiProperty({ example: 14 })
    ancho_producto!: number;

    @ApiProperty({ example: 18 })
    alto_producto!: number;

    @ApiProperty({ example: 14 })
    profundo_producto!: number;

    categoria!: {
        id: number;
        nombre: string;
    } | null;

    subcategoria!: {
        id: number;
        nombre: string;
    } | null;
}

export class PagoPedidoDto {
    @ApiProperty({ example: 1 })
    @IsInt()
    id!: number;

    @ApiProperty({ example: 1.99 })
    @IsDecimal()
    monto_total!: number;

    @ApiProperty({ example: '2023-12-01 00:00:00' })
    @IsString()
    fecha_pago!: string;

    @ApiProperty({ example: true })
    @IsBoolean()
    aprobado!: boolean;
}

export class UsuarioPedidoDto {
    @ApiProperty({ example: 1 })
    @IsInt()
    id!: number;

    @ApiProperty({ example: 'Juan Pérez' })
    @IsString()
    nombre!: string;

    @ApiProperty({ example: 'bvirinni@gmail.com' })
    @IsString()
    email!: string;

    @ApiProperty({ example: '1234567890' })
    @IsString()
    telefono!: string;
}

export class DireccionPedidoDto {

    @ApiProperty({ example: {
        nombre: 'Córdoba'
    } })
    provincia!: {
        nombre: string;
    }

    @ApiProperty({ example: {
        nombre: 'Córdoba Capital'
    } })
    ciudad!: {
        nombre: string;
    }

    @ApiProperty({ example: 'Calle Falsa' })
    @IsString()
    calle!: string;

    @ApiProperty({ example: '123' })
    @IsString()
    altura!: string;

    @ApiProperty({ example: 'X5016' })
    @IsString()
    cod_postal_destino!: string;
}

export class EnvioPedidoDto {
    @ApiProperty({ example: 1 })
    @IsInt()
    id!: number;

    @ApiProperty({ example: 1 })
    @IsInt()
    ancho_paquete!: number;

    @ApiProperty({ example: 1 })
    @IsInt()
    alto_paquete!: number;

    @ApiProperty({ example: 1 })
    @IsInt()
    profundo_paquete!: number;

    @ApiProperty({ example: {
        id: 1,
        nombre: 'En transporte'
    } })
    estado_envio!: {
        id: number;
        nombre: string;
    }

    direccion!: DireccionPedidoDto;
}

export class DetallePedidoResponseDto {
    @ApiProperty({ example: 1 })
    @IsInt()
    id!: number;

    @ApiProperty({ example: "2023-12-01 00:00:00" })
    fecha_pedido!: string;

    @ApiProperty({ example: 1.99 })
    costo_total_productos!: number;

    @ApiProperty({ example: 1.99 })
    costo_envio!: number;

    @ApiProperty({ example: 1.99 })
    costo_ganancia_envio!: number;

    usuario!: UsuarioPedidoDto;
    pago!: PagoPedidoDto;
    envio!: EnvioPedidoDto;

    @ApiProperty({ type: DetalleItemPedidoDto, isArray: true, required: false })
    detalles?: DetalleItemPedidoDto[];

    estado_pedido!: {
        id: number;
        nombre: string;
    }
}