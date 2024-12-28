import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './http-exception.filter';
import { CustomLogger } from './logger.service'; // Import the custom logger

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Apply the exception filter globally
  const logger = app.get(CustomLogger); // Get the custom logger instance
  app.useGlobalFilters(new HttpExceptionFilter(logger));

  await app.listen(3000);
}
bootstrap();