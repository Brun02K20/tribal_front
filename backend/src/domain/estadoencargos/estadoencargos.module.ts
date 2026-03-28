import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { Role1Guard } from 'src/auth/utils/role1.guard';
import { EstadosEncargosController } from './estadoencargos.controller';
import { EstadoEncargosService } from './estadoencargos.service';

@Module({
    imports: [AuthModule],
    controllers: [EstadosEncargosController],
    providers: [EstadoEncargosService, Role1Guard],
})
export class EstadosEncargosModule {}
