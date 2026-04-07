import './instrument';

import { ValidationPipe } from '@nestjs/common';
import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { SentryExceptionFilter } from './common/filters/sentry-exception.filter';
import { SentryInterceptor } from './common/interceptors/sentry.interceptor';

async function bootstrap(): Promise<void>
{
  try
  {
    console.log('🚀 Starting NestJS application...');
    console.log(`📦 NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔌 PORT: ${process.env.PORT || 3000}`);
    console.log(`🌐 DATABASE_URL: ${process.env.DATABASE_URL ? 'Set' : 'Not set'}`);
    console.log(`🛰️ SENTRY_DSN: ${process.env.SENTRY_DSN ? 'Set' : 'Not set'}`);

    const application = await NestFactory.create(AppModule, {
      logger: ['error', 'warn', 'log', 'debug'],
    });

    const httpAdapterHost = application.get(HttpAdapterHost);

    application.useGlobalFilters(
      new SentryExceptionFilter(httpAdapterHost.httpAdapter),
    );

    application.use(helmet());

    const corsOrigins = process.env.CORS_ORIGIN
      ? process.env.CORS_ORIGIN.split(',').map((origin) => origin.trim())
      : ['http://localhost:4200', 'http://127.0.0.1:4200'];

    application.enableCors({
      origin: corsOrigins,
      credentials: true,
    });

    application.setGlobalPrefix('api');

    application.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    const swaggerConfiguration = new DocumentBuilder()
      .setTitle('Hyrox Tracker API')
      .setDescription('API for tracking Hyrox performances and trainings')
      .setVersion('1.0')
      .addBearerAuth()
      .addTag('auth', 'Authentication endpoints')
      .addTag('users', 'User management')
      .addTag('courses', 'Course management')
      .addTag('trainings', 'Training management')
      .addTag('stats', 'Statistics and analytics')
      .addTag('health', 'Health checks')
      .build();

    const swaggerDocument = SwaggerModule.createDocument(application, swaggerConfiguration);
    SwaggerModule.setup('api/docs', application, swaggerDocument);

    const port = Number(process.env.PORT) || 3000;
    const host = '0.0.0.0';

    application.useGlobalInterceptors(
      new SentryInterceptor(),
    );

    await application.listen(port, host);

    console.log(`✅ Application is running on: http://${host}:${port}`);
    console.log(`📚 API Documentation: http://${host}:${port}/api/docs`);
    console.log(`❤️ Health check: http://${host}:${port}/api/health/liveness`);
  }
  catch (error: unknown)
  {
    console.error('❌ Failed to start application:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    process.exit(1);
  }
}

void bootstrap();