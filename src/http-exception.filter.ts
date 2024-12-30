import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { GqlExceptionFilter } from '@nestjs/graphql';
import { Response } from 'express';
import axios from 'axios';
import { CustomLogger } from './logger.service';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter, GqlExceptionFilter {
  constructor(private logger: CustomLogger) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const contextType = host.getType() as string;

    if (contextType === 'http') {
      const ctx = host.switchToHttp();
      const response = ctx.getResponse<Response>();
      const request = ctx.getRequest();

      let status = HttpStatus.INTERNAL_SERVER_ERROR;
      let message = 'An unexpected error occurred';

      if (exception instanceof HttpException) {
        status = exception.getStatus();
        const error: any = exception.getResponse();
        message = error?.message || message;
      } else if (axios.isAxiosError(exception)) {
        if (exception.response) {
          status = exception.response.status;
          message = exception.response.data.error?.message || 'Error fetching data';
        } else if (exception.request) {
          status = HttpStatus.GATEWAY_TIMEOUT;
          message = 'No response received from the weather service';
        } else {
          message = exception.message;
        }
      }
      this.logger.error(`Error occurred: ${message}`, exception instanceof Error ? exception.stack : '');
      response.status(status).json({
        statusCode: status,
        message,
        timestamp: new Date().toISOString(),
        path: request.url,
      });
    } else if (contextType === 'graphql') {
      // Handle GraphQL errors
      let message : any= 'An unexpected error occurred';

      if (exception instanceof HttpException) {
        const errorResponse = exception.getResponse();
        if (typeof errorResponse === 'object' && 'message' in errorResponse) {
          message = (errorResponse as any).message;
        } else if (typeof errorResponse === 'string') {
          message = errorResponse;
        }
      } else if (axios.isAxiosError(exception)) {
        message = exception.message || 'Error during GraphQL execution';
      }
      this.logger.error(`GraphQL Error: ${message}`, exception instanceof Error ? exception.stack : '');
      throw new Error(message);
    }
  }
}
