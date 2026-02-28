import { Module } from '@nestjs/common';
import { EstadosEnviosController } from './estadoenvios.controller';
import { EstadoEnviosService } from './estadoenvios.service';
import { AuthModule } from 'src/auth/auth.module';
import { Role1Guard } from 'src/auth/utils/role1.guard';

@Module({
    imports: [AuthModule],
    controllers: [EstadosEnviosController],
    providers: [EstadoEnviosService, Role1Guard],
})
export class EstadosEnviosModule {}
