import { Injectable } from '@nestjs/common';

@Injectable()
export class HealthService {
  getHealth() {
    return {
      status: 'ok',
      service: 'fleet-core',
      timestamp: new Date().toISOString(),
    };
  }
}
