import { Module } from '@nestjs/common';
import { BusquedaSemanticaService } from './busqueda-semantica.service';

@Module({
    providers: [BusquedaSemanticaService],
    exports: [BusquedaSemanticaService],
})
export class BusquedaSemanticaModule {}
