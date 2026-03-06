import { Module } from '@nestjs/common';
import { CategoriasController } from './categorias.controller';
import { CategoriasService } from './categorias.service';
import { AuthModule } from 'src/auth/auth.module';
import { Role1Guard } from 'src/auth/utils/role1.guard';

@Module({
    imports: [AuthModule],
    controllers: [CategoriasController],
    providers: [CategoriasService, Role1Guard],
})
export class CategoriasModule {}
