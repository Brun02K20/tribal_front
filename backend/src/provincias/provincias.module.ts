import { Module } from '@nestjs/common';
import { ProvinciasController } from './provincias.controller';
import { ProvinciasService } from './provincias.service';

@Module({
	controllers: [ProvinciasController],
	providers: [ProvinciasService],
})
export class ProvinciasModule {}
