import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProvinciasModule } from './provincias/provincias.module';
import { AuthModule } from './auth/auth.module';
import { FotosModule } from './fotos/fotos.module';
import { PagosModule } from './pagos/pagos.module';

@Module({
  imports: [ProvinciasModule, AuthModule, FotosModule, PagosModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}