import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import type { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const request = context.getRequest<Request>();
    const response = context.getResponse<Response>();
    // Preserve Nest's HTTP status and avoid exposing details from unknown exceptions.
    const statusCode =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let message: string | string[] = 'Error interno del servidor.';
    if (exception instanceof HttpException) {
      const exceptionResponse = exception.getResponse();
      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (
        typeof exceptionResponse === 'object' &&
        exceptionResponse !== null &&
        'message' in exceptionResponse
      ) {
        const exceptionMessage = (exceptionResponse as { message?: unknown })
          .message;
        if (typeof exceptionMessage === 'string' || Array.isArray(exceptionMessage)) {
          message = exceptionMessage as string | string[];
        }
      }
    }

    response.status(statusCode).json({
      statusCode,
      success: false,
      message,
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }
}
