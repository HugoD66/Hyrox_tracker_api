import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  try {
    console.log('🚀 Starting NestJS application...');
    console.log(`📦 NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔌 PORT: ${process.env.PORT || 3000}`);
    console.log(`🌐 DATABASE_URL: ${process.env.DATABASE_URL ? 'Set' : 'Not set'}`);

    const app = await NestFactory.create(AppModule, {
      logger: ['error', 'warn', 'log', 'debug'],
    });

    app.use(helmet());

    const corsOrigins = process.env.CORS_ORIGIN
      ? process.env.CORS_ORIGIN.split(',').map((origin) => origin.trim())
      : ['http://localhost:4200', 'http://127.0.0.1:4200'];

    console.log(`🌍 CORS Origins: ${corsOrigins.join(', ')}`);

    app.enableCors({
      origin: corsOrigins,
      credentials: true,
    });

    app.setGlobalPrefix('api');

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    const config = new DocumentBuilder()
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

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);

    const port = Number(process.env.PORT) || 3000;
    const host = '0.0.0.0';

    console.log(`🔌 Attempting to listen on ${host}:${port}...`);

    await app.listen(port, host);

    console.log(`✅ Application is running on: http://${host}:${port}`);
    console.log(`📚 API Documentation: http://${host}:${port}/api/docs`);
    console.log(`❤️  Health check: http://${host}:${port}/api/health/liveness`);
  } catch (error) {
    console.error('❌ Failed to start application:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    process.exit(1);
  }
}

bootstrap();
