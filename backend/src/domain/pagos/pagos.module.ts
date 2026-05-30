import { Module } from '@nestjs/common';
import { PagosController } from './pagos.controller';
import { PagosService } from './pagos.service';
import { CorreoArgentinoModule } from '../correoArgentino/correoArgentino.module';

@Module({
	imports: [CorreoArgentinoModule],
	controllers: [PagosController],
	providers: [PagosService],
})
export class PagosModule {}
