import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProvinciasModule } from './provincias/provincias.module';

@Module({
  imports: [ProvinciasModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
