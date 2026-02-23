import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProvinciasModule } from './provincias/provincias.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [ProvinciasModule, AuthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
