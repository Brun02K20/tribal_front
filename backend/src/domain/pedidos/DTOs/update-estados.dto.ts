import { ApiProperty } from '@nestjs/swagger';
import { IsInt } from 'class-validator';

export class UpdateEstadoPedidoDto {
    @ApiProperty({ example: 2 })
    @IsInt()
    id_estado_pedido!: number;
}

export class UpdateEstadoEnvioDto {
    @ApiProperty({ example: 3 })
    @IsInt()
    id_estado_envio!: number;
}
