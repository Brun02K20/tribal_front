import { Module } from '@nestjs/common';
import { SubcategoriasController } from './subcategorias.controller';
import { SubcategoriasService } from './subcategorias.service';
import { CategoriasService } from 'src/domain/categorias/categorias.service';
import { AuthModule } from 'src/auth/auth.module';
import { Role1Guard } from 'src/auth/utils/role1.guard';

@Module({
    imports: [AuthModule],
    controllers: [SubcategoriasController],
    providers: [SubcategoriasService, CategoriasService, Role1Guard],
})
export class SubcategoriasModule {}
