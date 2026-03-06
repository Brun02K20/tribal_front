import { Module } from '@nestjs/common';
import { FotosController } from './fotos.controller';
import { FotosService } from './fotos.service';

@Module({
	controllers: [FotosController],
	providers: [FotosService],
})
export class FotosModule {}
