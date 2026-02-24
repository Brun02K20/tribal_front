import { Module } from '@nestjs/common';
import { SubcategoriasController } from './subcategorias.controller';
import { SubcategoriasService } from './subcategorias.service';
import { CategoriasService } from 'src/categorias/categorias.service';

@Module({
    controllers: [SubcategoriasController],
    providers: [SubcategoriasService, CategoriasService],
})
export class SubcategoriasModule {}
