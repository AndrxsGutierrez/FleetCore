import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vehicle, VehicleStatus } from '../entities/vehicle.entity.js';

@Injectable()
export class VehicleDao {
  constructor(
    @InjectRepository(Vehicle)
    private readonly repository: Repository<Vehicle>,
  ) {}

  create(data: Partial<Vehicle>): Vehicle {
    return this.repository.create(data);
  }

  save(vehicle: Vehicle): Promise<Vehicle> {
    return this.repository.save(vehicle);
  }

  findAll(status?: VehicleStatus): Promise<Vehicle[]> {
    return this.repository.find({
      where: status ? { status } : {},
      order: { id: 'ASC' },
    });
  }

  findById(id: number): Promise<Vehicle | null> {
    return this.repository.findOneBy({ id });
  }

  findByPlate(plate: string): Promise<Vehicle | null> {
    return this.repository.findOneBy({ plate });
  }

  async plateInUse(plate: string, exceptId?: number): Promise<boolean> {
    const query = this.repository.createQueryBuilder('vehicle').where('vehicle.plate = :plate', {
      plate,
    });
    if (exceptId !== undefined) query.andWhere('vehicle.id != :exceptId', { exceptId });
    return query.getExists();
  }
}
