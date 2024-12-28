import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
  } from '@nestjs/common';
  import { Response } from 'express';
  import axios from 'axios';
  import { CustomLogger } from './logger.service'; // Import the custom logger
  
  @Catch()
  export class HttpExceptionFilter implements ExceptionFilter {
    constructor(private logger: CustomLogger) {} // Inject the custom logger
  
    catch(exception: unknown, host: ArgumentsHost) {
      const ctx = host.switchToHttp();
      const response = ctx.getResponse<Response>();
      const request = ctx.getRequest();
  
      let status = HttpStatus.INTERNAL_SERVER_ERROR;
      let message : string = 'An unexpected error occurred';
  
      if (exception instanceof HttpException) {
        status = exception.getStatus();
        let error: any = exception.getResponse();
        message = error?.message;
      } else if (axios.isAxiosError(exception)) {
        if (exception.response) {
          status = exception.response.status;
          message = exception.response.data.error.message || 'Error fetching data';
        } else if (exception.request) {
          status = HttpStatus.GATEWAY_TIMEOUT;
          message = 'No response received from the weather service';
        } else {
          message = exception.message;
        }
      }
  
      // Log the error using the custom logger
      this.logger.error(`Error occurred: ${message}`, exception instanceof Error ? exception.stack : '');
  
      // Send the response
      response.status(status).json({
        statusCode: status,
        message,
        timestamp: new Date().toISOString(),
        path: request.url,
      });
    }
  }