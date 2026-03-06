import { Module } from '@nestjs/common';
import * as dotenv from 'dotenv';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProvinciasModule } from './domain/provincias/provincias.module';
import { AuthModule } from './auth/auth.module';
import { FotosModule } from './domain/fotos/fotos.module';
import { PagosModule } from './domain/pagos/pagos.module';
import { CiudadesModule } from './domain/ciudades/ciudades.module';
import { CategoriasModule } from './domain/categorias/categorias.module';
import { SubcategoriasModule } from './domain/subcategorias/subcategorias.module';
import { EstadosPedidosModule } from './domain/estadopedidos/estadopedido.module';
import { UsuariosModule } from './auth/usuarios/usuarios.module';
import { ProductosModule } from './domain/productos/productos.module';
import { EstadosEnviosModule } from './domain/estadoenvios/estadoenvios.module';
import { PedidosModule } from './domain/pedidos/pedidos.module';
import { MetricasModule } from './domain/metricas/metricas.module';
import { AiModule } from './domain/ai/ai.module';
import { ResenasModule } from './domain/resenas/resenas.module';
import { ChatModule } from './domain/chat/chat.module';

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