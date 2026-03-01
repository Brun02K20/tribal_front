import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { connectToDatabase } from './database/database';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { GlobalExceptionFilter } from './errors/global-exception.filter';
import { xssValidationMiddleware } from './middlewares/xss-validation.middleware';

async function bootstrap() {
  await connectToDatabase();
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new GlobalExceptionFilter());
  app.use(xssValidationMiddleware);
  const expressApp = app.getHttpAdapter().getInstance();

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Tribal API')
    .setDescription('Documentación del monolito backend (NestJS)')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        in: 'header',
      },
      'bearer',
    )
    .addSecurityRequirements('bearer')
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
}
bootstrap();
