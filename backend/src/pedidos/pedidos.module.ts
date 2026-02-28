import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { Role2Guard } from 'src/auth/utils/role2.guard';
import { PedidosController } from './pedidos.controller';
import { PedidosService } from './pedidos.service';

@Module({
	imports: [AuthModule],
	controllers: [PedidosController],
	providers: [PedidosService, Role2Guard],
})
export class PedidosModule {}
