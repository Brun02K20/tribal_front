import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProvinciasModule } from './provincias/provincias.module';
import { AuthModule } from './auth/auth.module';
import { FotosModule } from './fotos/fotos.module';
import { PagosModule } from './pagos/pagos.module';
import { CiudadesModule } from './ciudades/ciudades.module';
import { CategoriasModule } from './categorias/categorias.module';
import { SubcategoriasModule } from './subcategorias/subcategorias.module';
import { EstadosPedidosModule } from './estadopedidos/estadopedido.module';

@Module({
  imports: [ProvinciasModule, AuthModule, FotosModule, PagosModule, CiudadesModule, CategoriasModule, SubcategoriasModule, EstadosPedidosModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}