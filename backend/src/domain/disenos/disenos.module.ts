import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { Role1Guard } from 'src/auth/utils/role1.guard';
import { FotosModule } from 'src/domain/fotos/fotos.module';
import { DisenosController } from './disenos.controller';
import { DisenosService } from './disenos.service';

@Module({
    imports: [AuthModule, FotosModule],
    controllers: [DisenosController],
    providers: [DisenosService, Role1Guard],
    exports: [DisenosService],
})
export class DisenosModule {}
