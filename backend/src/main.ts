import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { connectToDatabase } from './database/database';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { GlobalExceptionFilter } from './errors/global-exception.filter';
import { xssValidationMiddleware } from './middlewares/xss-validation.middleware';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';

async function bootstrap() {
  await connectToDatabase();
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  app.useGlobalFilters(new GlobalExceptionFilter());
  app.use(xssValidationMiddleware);
  const expressApp = app.getHttpAdapter().getInstance();

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Tribal API')
    .setDescription('Documentación del monolito backend (NestJS)')
    .setVersion('1.0')
    .addCookieAuth(
      'access_token',
      {
        type: 'apiKey',
        in: 'cookie',
        description: 'Cookie de sesión HTTP-only emitida por /auth/login o /auth/register',
      },
      'cookieAuth',
    )
    .addSecurityRequirements('cookieAuth')
    .build();

  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('swagger', app, swaggerDocument);
  SwaggerModule.setup('docs', app, swaggerDocument);

  expressApp.get('/swagger/index.html', (_req, res) => {
    res.redirect('/swagger');
  });

  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      statusCode: 429,
      message: 'Demasiados intentos de autenticación. Probá de nuevo en unos minutos.',
    },
  });

  const sensitiveLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 60,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      statusCode: 429,
      message: 'Demasiadas solicitudes para esta ruta sensible. Intentá nuevamente en breve.',
    },
  });

  expressApp.use('/auth', authLimiter);
  expressApp.use('/chat', sensitiveLimiter);
  expressApp.use('/usuarios', sensitiveLimiter);
  expressApp.use('/pedidos', sensitiveLimiter);
  expressApp.use('/pagos', sensitiveLimiter);

  app.enableCors({
    origin: process.env.FRONTEND_URL?.split(',') ?? true,
    credentials: true,
  });
  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
