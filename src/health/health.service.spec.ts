import { HealthService } from './health.service.js';

describe('HealthService', () => {
  it('returns an ok status and an ISO timestamp', () => {
    const service = new HealthService();

    const result = service.getHealth();

    expect(result.status).toBe('ok');
    expect(result.service).toBe('fleet-core');
    expect(new Date(result.timestamp).toISOString()).toBe(result.timestamp);
  });
});
