import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Maintenance } from '../../maintenances/entities/maintenance.entity.js';

@Injectable()
export class VehicleIntegrationDao {
  constructor(
    @InjectRepository(Maintenance)
    private readonly maintenanceRepository: Repository<Maintenance>,
  ) {}

  findMaintenanceHistory(vehicleId: number): Promise<Maintenance[]> {
    return this.maintenanceRepository.find({
      where: { vehicle: { id: vehicleId } },
      relations: { mechanic: true, workshop: true },
      order: { scheduledDate: 'DESC' },
    });
  }
}
