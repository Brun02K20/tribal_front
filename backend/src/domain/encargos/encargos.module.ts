import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { Role1Guard } from 'src/auth/utils/role1.guard';
import { Role2Guard } from 'src/auth/utils/role2.guard';
import { EncargosController } from './encargos.controller';
import { EncargosService } from './encargos.service';

@Module({
    imports: [AuthModule],
    controllers: [EncargosController],
    providers: [EncargosService, Role1Guard, Role2Guard],
})
export class EncargosModule {}
