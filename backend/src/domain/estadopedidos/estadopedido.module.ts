import { Module } from '@nestjs/common';
import { EstadosPedidosController } from './estadopedidos.controller';
import { EstadoPedidosService } from './estadopedido.service';
import { AuthModule } from 'src/auth/auth.module';
import { Role1Guard } from 'src/auth/utils/role1.guard';

@Module({
    imports: [AuthModule],
    controllers: [EstadosPedidosController],
    providers: [EstadoPedidosService, Role1Guard],
})
export class EstadosPedidosModule {}
