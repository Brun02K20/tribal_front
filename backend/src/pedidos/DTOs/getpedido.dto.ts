import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsString, IsDecimal } from 'class-validator';

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
        nombre: 'En transporte'
    } })
    estado_envio!: {
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

    estado_pedido!: {
        nombre: string;
    }
}