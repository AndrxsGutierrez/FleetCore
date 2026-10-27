import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { concatMap, Observable } from 'rxjs';
import type { AuthenticatedUser } from '../auth/authenticated-user.js';
import { AuditsService } from './audits.service.js';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuditInterceptor.name);

  constructor(private readonly auditsService: AuditsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const http = context.switchToHttp();
    const request = http.getRequest<Request & { user?: AuthenticatedUser }>();
    const response = http.getResponse<Response>();
    const changesState = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(
      request.method,
    );
    const isLogin = request.path === '/auth/login';

    // Audit successful writes only; never store request bodies that may contain secrets.
    if (!changesState || isLogin) return next.handle();

    return next.handle().pipe(
      concatMap(async (result: unknown) => {
        try {
          await this.auditsService.recordSuccessfulChange(
            request,
            response.statusCode,
            result,
          );
        } catch (error) {
          const reason = error instanceof Error ? error.message : String(error);
          this.logger.error(`No se pudo guardar la auditoría: ${reason}`);
        }
        return result;
      }),
    );
  }
}
