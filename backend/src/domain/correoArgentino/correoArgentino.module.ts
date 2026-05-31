import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { CorreoArgentinoService } from './correoArgentino.service';
import { CorreoArgentinoController } from './correoArgentino.controller';

@Module({
  imports: [AuthModule],
  controllers: [CorreoArgentinoController],
  providers: [CorreoArgentinoService],
  exports: [CorreoArgentinoService],
})
export class CorreoArgentinoModule {}