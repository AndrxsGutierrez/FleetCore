import { timingSafeEqual } from 'node:crypto';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const providedKey = request.header('x-api-key');
    const configuredKeys = (this.configService.get<string>('API_KEYS') ?? '')
      .split(',')
      .map((key) => key.trim())
      .filter(Boolean);

    // Compare equal-length buffers in constant time to avoid leaking key prefixes.
    const isValid = configuredKeys.some((configuredKey) => {
      const provided = Buffer.from(providedKey ?? '');
      const expected = Buffer.from(configuredKey);
      return (
        provided.length === expected.length &&
        timingSafeEqual(provided, expected)
      );
    });
    if (!isValid)
      throw new UnauthorizedException(
        'La API Key es inválida o no fue enviada.',
      );
    return true;
  }
}
