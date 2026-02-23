import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProvinciasModule } from './provincias/provincias.module';
import { AuthModule } from './auth/auth.module';
import { FotosModule } from './fotos/fotos.module';

@Module({
  imports: [ProvinciasModule, AuthModule, FotosModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
