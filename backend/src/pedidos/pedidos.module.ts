import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { Role1Guard } from 'src/auth/utils/role1.guard';
import { Role2Guard } from 'src/auth/utils/role2.guard';
import { PedidosController } from './pedidos.controller';
import { PedidosService } from './pedidos.service';
import { Role1OrOwnerPedidoGuard } from './guards/role1-or-owner-pedido.guard';

@Module({
	imports: [AuthModule],
	controllers: [PedidosController],
	providers: [PedidosService, Role2Guard, Role1Guard, Role1OrOwnerPedidoGuard],
})
export class PedidosModule {}
