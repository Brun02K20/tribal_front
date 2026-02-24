import { Module } from '@nestjs/common';
import { CiudadesController } from './ciudades.controller';
import { CiudadesService } from './ciudades.service';
import { ProvinciasService } from 'src/provincias/provincias.service';

@Module({
    controllers: [CiudadesController],
    providers: [CiudadesService, ProvinciasService],
})
export class CiudadesModule {}
