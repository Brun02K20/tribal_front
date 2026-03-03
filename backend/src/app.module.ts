import { Module } from '@nestjs/common';
import * as dotenv from 'dotenv';
import { MongooseModule } from '@nestjs/mongoose';
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
import { UsuariosModule } from './auth/usuarios/usuarios.module';
import { ProductosModule } from './productos/productos.module';
import { EstadosEnviosModule } from './estadoenvios/estadoenvios.module';
import { PedidosModule } from './pedidos/pedidos.module';
import { MetricasModule } from './metricas/metricas.module';
import { AiModule } from './ai/ai.module';
import { ResenasModule } from './resenas/resenas.module';
import { ChatModule } from './chat/chat.module';

dotenv.config();

@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGODB_URI ?? 'mongodb://localhost:27017/tribal_trend'),
    ProvinciasModule, 
    AuthModule,
    FotosModule, 
    PagosModule, 
    CiudadesModule, 
    CategoriasModule,
    SubcategoriasModule,
    EstadosPedidosModule,
    UsuariosModule,
    ProductosModule,
    EstadosEnviosModule,
    PedidosModule,
    MetricasModule,
    AiModule,
    ResenasModule,
    ChatModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}