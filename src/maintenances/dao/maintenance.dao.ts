import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { Mechanic } from '../../mechanics/entities/mechanic.entity.js';
import { Vehicle } from '../../vehicles/entities/vehicle.entity.js';
import { Workshop } from '../../workshops/entities/workshop.entity.js';
import { ListMaintenancesDto } from '../dto/list-maintenances.dto.js';
import {
  Maintenance,
  MaintenanceStatus,
} from '../entities/maintenance.entity.js';

@Injectable()
export class MaintenanceDao {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(Maintenance)
    private readonly repository: Repository<Maintenance>,
  ) {}

  transaction<T>(
    operation: (manager: EntityManager) => Promise<T>,
  ): Promise<T> {
    return this.dataSource.transaction(operation);
  }

  lockVehicle(manager: EntityManager, id: number): Promise<Vehicle | null> {
    return manager.getRepository(Vehicle).findOne({
      where: { id },
      lock: { mode: 'pessimistic_write' },
    });
  }

  lockMechanic(manager: EntityManager, id: number): Promise<Mechanic | null> {
    return manager.getRepository(Mechanic).findOne({
      where: { id },
      lock: { mode: 'pessimistic_write' },
    });
  }

  lockWorkshop(manager: EntityManager, id: number): Promise<Workshop | null> {
    return manager.getRepository(Workshop).findOne({
      where: { id },
      lock: { mode: 'pessimistic_write' },
    });
  }

  lockMaintenance(
    manager: EntityManager,
    id: number,
  ): Promise<Maintenance | null> {
    return manager.getRepository(Maintenance).findOne({
      where: { id },
      lock: { mode: 'pessimistic_write' },
    });
  }

  hasActiveMaintenanceForVehicle(
    manager: EntityManager,
    vehicleId: number,
  ): Promise<boolean> {
    return manager
      .getRepository(Maintenance)
      .createQueryBuilder('maintenance')
      .innerJoin('maintenance.vehicle', 'vehicle')
      .where('vehicle.id = :vehicleId', { vehicleId })
      .andWhere('maintenance.status IN (:...statuses)', {
        statuses: [MaintenanceStatus.SCHEDULED, MaintenanceStatus.IN_PROGRESS],
      })
      .getExists();
  }

  hasMechanicScheduleOverlap(
    manager: EntityManager,
    mechanicId: number,
    start: Date,
    end: Date,
  ): Promise<boolean> {
    return manager
      .getRepository(Maintenance)
      .createQueryBuilder('maintenance')
      .innerJoin('maintenance.mechanic', 'mechanic')
      .where('mechanic.id = :mechanicId', { mechanicId })
      .andWhere('maintenance.status IN (:...statuses)', {
        statuses: [MaintenanceStatus.SCHEDULED, MaintenanceStatus.IN_PROGRESS],
      })
      .andWhere('maintenance.scheduledDate < :end', { end })
      .andWhere('maintenance.scheduledEndDate > :start', { start })
      .getExists();
  }

  create(manager: EntityManager, data: Partial<Maintenance>): Maintenance {
    return manager.getRepository(Maintenance).create(data);
  }

  save(manager: EntityManager, maintenance: Maintenance): Promise<Maintenance> {
    return manager.getRepository(Maintenance).save(maintenance);
  }

  saveVehicle(manager: EntityManager, vehicle: Vehicle): Promise<Vehicle> {
    return manager.getRepository(Vehicle).save(vehicle);
  }

  findAll(query: ListMaintenancesDto): Promise<Maintenance[]> {
    return this.repository.find({
      where: query.status ? { status: query.status } : {},
      relations: { vehicle: true, mechanic: true, workshop: true },
      order: { scheduledDate: 'DESC' },
    });
  }

  findActive(): Promise<Maintenance[]> {
    return this.repository
      .createQueryBuilder('maintenance')
      .leftJoinAndSelect('maintenance.vehicle', 'vehicle')
      .leftJoinAndSelect('maintenance.mechanic', 'mechanic')
      .leftJoinAndSelect('maintenance.workshop', 'workshop')
      .where('maintenance.status IN (:...statuses)', {
        statuses: [MaintenanceStatus.SCHEDULED, MaintenanceStatus.IN_PROGRESS],
      })
      .orderBy('maintenance.scheduledDate', 'ASC')
      .getMany();
  }

  findById(id: number): Promise<Maintenance | null> {
    return this.repository.findOne({
      where: { id },
      relations: { vehicle: true, mechanic: true, workshop: true },
    });
  }

  findByIdForMechanic(id: number, mechanicId: number): Promise<Maintenance | null> {
    return this.repository.findOne({
      where: { id, mechanic: { id: mechanicId } },
      relations: { vehicle: true, mechanic: true, workshop: true },
    });
  }

  findByVehicle(vehicleId: number): Promise<Maintenance[]> {
    return this.repository.find({
      where: { vehicle: { id: vehicleId } },
      relations: { vehicle: true, mechanic: true, workshop: true },
      order: { scheduledDate: 'DESC' },
    });
  }

  findByMechanic(mechanicId: number): Promise<Maintenance[]> {
    return this.repository.find({
      where: { mechanic: { id: mechanicId } },
      relations: { vehicle: true, mechanic: true, workshop: true },
      order: { scheduledDate: 'ASC' },
    });
  }

  lockVehicleForStatusUpdate(
    manager: EntityManager,
    id: number,
  ): Promise<Vehicle | null> {
    return this.lockVehicle(manager, id);
  }

  async findVehicleId(
    manager: EntityManager,
    maintenanceId: number,
  ): Promise<number | null> {
    const maintenance = await manager.getRepository(Maintenance).findOne({
      where: { id: maintenanceId },
      relations: { vehicle: true },
    });
    return maintenance?.vehicle.id ?? null;
  }

  async findMechanicId(
    manager: EntityManager,
    maintenanceId: number,
  ): Promise<number | null> {
    const maintenance = await manager.getRepository(Maintenance).findOne({
      where: { id: maintenanceId },
      relations: { mechanic: true },
    });
    return maintenance?.mechanic.id ?? null;
  }
}
