import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Validation globale des DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // CORS pour le frontend
  app.enableCors({
    origin: ['http://localhost:4000', 'http://localhost:3001'],
    credentials: true,
  });

  // Prefix API
  app.setGlobalPrefix('api');

  await app.listen(process.env.PORT ?? 3000);
  console.log(`🚀 NutryLog API running on http://localhost:${process.env.PORT ?? 3000}`);
}
bootstrap();
