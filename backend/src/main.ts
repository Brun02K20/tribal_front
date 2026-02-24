import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { connectToDatabase } from './database/database';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { sendTestEmail } from './utils/mail/smtp';

async function bootstrap() {
  await connectToDatabase();
  const app = await NestFactory.create(AppModule);
  const expressApp = app.getHttpAdapter().getInstance();

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Tribal API')
    .setDescription('Documentación del monolito backend (NestJS)')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('swagger', app, swaggerDocument);
  SwaggerModule.setup('docs', app, swaggerDocument);

  expressApp.get('/swagger/index.html', (_req, res) => {
    res.redirect('/swagger');
  });

  app.enableCors({
    origin: process.env.FRONTEND_URL?.split(',') ?? true,
    credentials: true,
  });
  await app.listen(process.env.PORT ?? 3001);
  // await sendTestEmail();
}
bootstrap();
