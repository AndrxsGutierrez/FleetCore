import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import type { Request } from 'express';
import { map, Observable } from 'rxjs';

@Injectable()
export class HttpResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse();

    // Wrap every successful controller result in the API's shared response shape.
    return next.handle().pipe(
      map((data: unknown) => ({
        statusCode: response.statusCode,
        success: true,
        data,
        path: request.url,
        timestamp: new Date().toISOString(),
      })),
    );
  }
}
