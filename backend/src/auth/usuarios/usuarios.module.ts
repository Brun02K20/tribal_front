import { Module } from '@nestjs/common';
import { UsuariosController } from './usuarios.controller';
import { UsuariosService } from './usuarios.service';
import { AuthModule } from '../auth.module';
import { Role2Guard } from '../utils/role2.guard';
import { Role1Guard } from '../utils/role1.guard';
@Module({
    imports: [AuthModule],
    controllers: [UsuariosController],
    providers: [UsuariosService, Role2Guard, Role1Guard],
})
export class UsuariosModule {}
