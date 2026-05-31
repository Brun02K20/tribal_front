import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { FotosModule } from 'src/domain/fotos/fotos.module';
import { BlogsController } from './blogs.controller';
import { BlogsService } from './blogs.service';

@Module({
    imports: [AuthModule, FotosModule],
    controllers: [BlogsController],
    providers: [BlogsService],
})
export class BlogsModule {}