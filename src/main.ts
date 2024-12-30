import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './http-exception.filter';
import { CustomLogger } from './logger.service'; // Import the custom logger
import { WeatherService } from './weather/weather.service';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function startApplication() {
  const app = await NestFactory.create(AppModule);

  // Create a Swagger document configuration
  const config = new DocumentBuilder()
    .setTitle('API Documentation') 
    .setDescription('API description for the project')
    .setVersion('1.0') 
    .addBearerAuth() 
    .addTag('weather-api')
    .build();

  // Generate the Swagger document
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  // Apply the exception filter globally
  const logger = app.get(CustomLogger);
  app.useGlobalFilters(new HttpExceptionFilter(logger));
  logger.log("Applicaion started At"+ process.env.APP_PORT)
  await app.listen(process.env.APP_PORT);
}

async function runJob() {
  const appContext = await NestFactory.createApplicationContext(AppModule);
  const logger = appContext.get(CustomLogger);
  logger.log("Job Started.");
  const weatherService = appContext.get(WeatherService);
  await weatherService.updateWeatherDataForFavoriteCities();
  await appContext.close();
  logger.log("Applicaion Closed");
  process.exit(1);
}

async function bootstrap() {
  const args = process.argv[2];
  switch(args){
    case "update-weather-fab-locations":{
      runJob();
      break;
    };
    default:{
      startApplication();
    }
  }
}

bootstrap();