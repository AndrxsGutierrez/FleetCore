import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { HealthService } from './health.service.js';

@ApiTags('Salud')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @ApiOperation({ summary: 'Consultar el estado de la API' })
  @ApiOkResponse({
    description: 'La API está disponible.',
    schema: {
      example: {
        status: 'ok',
        service: 'fleet-core',
        timestamp: '2026-10-27T12:00:00.000Z',
      },
    },
  })
  check() {
    return this.healthService.getHealth();
  }
}
