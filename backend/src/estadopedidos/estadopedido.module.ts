import { Module } from '@nestjs/common';
import { EstadosPedidosController } from './estadopedidos.controller';
import { EstadoPedidosService } from './estadopedido.service';

@Module({
    controllers: [EstadosPedidosController],
    providers: [EstadoPedidosService],
})
export class EstadosPedidosModule {}
