import { Module } from '@nestjs/common';
import { CorreoArgentinoService } from './correoArgentino.service';
import { CorreoArgentinoController } from './correoArgentino.controller';

@Module({
  controllers: [CorreoArgentinoController],
  providers: [CorreoArgentinoService],
  exports: [CorreoArgentinoService],
})
export class CorreoArgentinoModule {}