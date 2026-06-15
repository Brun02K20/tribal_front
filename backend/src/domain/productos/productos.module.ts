import { Module } from '@nestjs/common';
import { ProductosController } from './productos.controller';
import { ProductosService } from './productos.service';
import { FotosService } from 'src/domain/fotos/fotos.service';
import { AuthModule } from 'src/auth/auth.module';
import { Role1Guard } from 'src/auth/utils/role1.guard';
import { DescuentosModule } from 'src/domain/descuentos/descuentos.module';
import { DisenosModule } from 'src/domain/disenos/disenos.module';

@Module({
    imports: [AuthModule, DescuentosModule, DisenosModule],
    controllers: [ProductosController],
    providers: [ProductosService, FotosService, Role1Guard],
})
export class ProductosModule {}
