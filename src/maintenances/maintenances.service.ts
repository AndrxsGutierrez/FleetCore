import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { MechanicStatus } from '../mechanics/entities/mechanic.entity.js';
import { VehicleStatus } from '../vehicles/entities/vehicle.entity.js';
import { WorkshopStatus } from '../workshops/entities/workshop.entity.js';
import { CreateMaintenanceDto } from './dto/create-maintenance.dto.js';
import { ListMaintenancesDto } from './dto/list-maintenances.dto.js';
import { UpdateMaintenanceStatusDto } from './dto/update-maintenance-status.dto.js';
import {
  Maintenance,
  MaintenanceStatus,
} from './entities/maintenance.entity.js';
import { MaintenanceDao } from './dao/maintenance.dao.js';

@Injectable()
export class MaintenancesService {
  constructor(private readonly maintenanceDao: MaintenanceDao) {}

  findAll(query: ListMaintenancesDto): Promise<Maintenance[]> {
    return this.maintenanceDao.findAll(query);
  }

  findActive(): Promise<Maintenance[]> {
    return this.maintenanceDao.findActive();
  }

  async findOne(id: number): Promise<Maintenance> {
    const maintenance = await this.maintenanceDao.findById(id);
    if (!maintenance) {
      throw new NotFoundException(
        `No existe un mantenimiento con identificador ${id}.`,
      );
    }
    return maintenance;
  }

  findByVehicle(vehicleId: number): Promise<Maintenance[]> {
    return this.maintenanceDao.findByVehicle(vehicleId);
  }

  findHistoryByVehicle(vehicleId: number): Promise<Maintenance[]> {
    return this.maintenanceDao.findByVehicle(vehicleId);
  }

  findByMechanic(mechanicId: number): Promise<Maintenance[]> {
    return this.maintenanceDao.findByMechanic(mechanicId);
  }

  async create(dto: CreateMaintenanceDto): Promise<Maintenance> {
    const scheduledDate = new Date(dto.scheduledDate);
    const scheduledEndDate = new Date(dto.scheduledEndDate);
    if (scheduledEndDate <= scheduledDate) {
      throw new BadRequestException(
        'La fecha de finalización programada debe ser posterior al inicio.',
      );
    }

    // Row locks serialize bookings for the same vehicle or mechanic, including concurrent requests.
    const createdId = await this.maintenanceDao.transaction(async (manager) => {
      const vehicle = await this.maintenanceDao.lockVehicle(
        manager,
        dto.vehicleId,
      );
      if (!vehicle) {
        throw new NotFoundException(
          `No existe un vehículo con identificador ${dto.vehicleId}.`,
        );
      }
      if (vehicle.status === VehicleStatus.INACTIVE) {
        throw new ConflictException(
          'No se pueden programar mantenimientos para vehículos inactivos.',
        );
      }
      if (vehicle.status === VehicleStatus.IN_MAINTENANCE) {
        throw new ConflictException(
          'El vehículo ya se encuentra en mantenimiento.',
        );
      }
      if (dto.mileage < vehicle.mileage) {
        throw new ConflictException(
          'El kilometraje del mantenimiento no puede ser menor al del vehículo.',
        );
      }

      const mechanic = await this.maintenanceDao.lockMechanic(
        manager,
        dto.mechanicId,
      );
      if (!mechanic) {
        throw new NotFoundException(
          `No existe un mecánico con identificador ${dto.mechanicId}.`,
        );
      }
      if (mechanic.status !== MechanicStatus.ACTIVE) {
        throw new ConflictException(
          'No se pueden asignar mecánicos inactivos a mantenimientos.',
        );
      }

      const workshop = await this.maintenanceDao.lockWorkshop(
        manager,
        dto.workshopId,
      );
      if (!workshop) {
        throw new NotFoundException(
          `No existe un taller con identificador ${dto.workshopId}.`,
        );
      }
      if (workshop.status !== WorkshopStatus.ACTIVE) {
        throw new ConflictException(
          'No se pueden asignar mantenimientos a talleres inactivos.',
        );
      }

      if (
        await this.maintenanceDao.hasActiveMaintenanceForVehicle(
          manager,
          vehicle.id,
        )
      ) {
        throw new ConflictException(
          'El vehículo ya tiene un mantenimiento activo.',
        );
      }
      if (
        await this.maintenanceDao.hasMechanicScheduleOverlap(
          manager,
          mechanic.id,
          scheduledDate,
          scheduledEndDate,
        )
      ) {
        throw new ConflictException(
          'El mecánico ya tiene un mantenimiento activo en ese horario.',
        );
      }

      const maintenance = this.maintenanceDao.create(manager, {
        type: dto.type,
        description: dto.description.trim(),
        mileage: dto.mileage,
        scheduledDate,
        scheduledEndDate,
        status: MaintenanceStatus.SCHEDULED,
        vehicle,
        mechanic,
        workshop,
      });
      const saved = await this.maintenanceDao.save(manager, maintenance);
      return saved.id;
    });

    return this.findOne(createdId);
  }

  async updateStatus(
    id: number,
    dto: UpdateMaintenanceStatusDto,
  ): Promise<Maintenance> {
    // The maintenance transition and its vehicle availability change commit or roll back together.
    await this.maintenanceDao.transaction(async (manager) => {
      const maintenance = await this.maintenanceDao.lockMaintenance(
        manager,
        id,
      );
      if (!maintenance) {
        throw new NotFoundException(
          `No existe un mantenimiento con identificador ${id}.`,
        );
      }

      this.assertValidTransition(maintenance.status, dto.status);
      this.assertClosureFields(dto);

      const vehicleId = await this.maintenanceDao.findVehicleId(manager, id);
      if (vehicleId === null) {
        throw new NotFoundException(
          'No se encontró el vehículo relacionado con el mantenimiento.',
        );
      }
      const vehicle = await this.maintenanceDao.lockVehicleForStatusUpdate(
        manager,
        vehicleId,
      );
      if (!vehicle) {
        throw new NotFoundException(
          `No existe un vehículo con identificador ${vehicleId}.`,
        );
      }

      if (dto.status === MaintenanceStatus.IN_PROGRESS) {
        if (vehicle.status !== VehicleStatus.AVAILABLE) {
          throw new ConflictException(
            'El vehículo no está disponible para iniciar el mantenimiento.',
          );
        }
        vehicle.status = VehicleStatus.IN_MAINTENANCE;
        await this.maintenanceDao.saveVehicle(manager, vehicle);
      }

      if (dto.status === MaintenanceStatus.COMPLETED) {
        const finalMileage = dto.finalMileage!;
        if (
          finalMileage < maintenance.mileage ||
          finalMileage < vehicle.mileage
        ) {
          throw new ConflictException(
            'El kilometraje final no puede ser menor al kilometraje actual o al registrado al programar.',
          );
        }
        maintenance.workPerformed = dto.workPerformed!.trim();
        maintenance.finalCost = dto.finalCost!;
        maintenance.completedAt = new Date(dto.completedAt!);
        maintenance.finalMileage = finalMileage;
        vehicle.mileage = finalMileage;
        vehicle.status = VehicleStatus.AVAILABLE;
        await this.maintenanceDao.saveVehicle(manager, vehicle);
      }

      if (dto.status === MaintenanceStatus.CANCELLED) {
        if (maintenance.status === MaintenanceStatus.IN_PROGRESS) {
          vehicle.status = VehicleStatus.AVAILABLE;
          await this.maintenanceDao.saveVehicle(manager, vehicle);
        }
      }

      maintenance.status = dto.status;
      await this.maintenanceDao.save(manager, maintenance);
    });

    return this.findOne(id);
  }

  private assertValidTransition(
    current: MaintenanceStatus,
    next: MaintenanceStatus,
  ): void {
    const allowed: Record<MaintenanceStatus, MaintenanceStatus[]> = {
      [MaintenanceStatus.SCHEDULED]: [
        MaintenanceStatus.IN_PROGRESS,
        MaintenanceStatus.CANCELLED,
      ],
      [MaintenanceStatus.IN_PROGRESS]: [
        MaintenanceStatus.COMPLETED,
        MaintenanceStatus.CANCELLED,
      ],
      [MaintenanceStatus.COMPLETED]: [],
      [MaintenanceStatus.CANCELLED]: [],
    };
    if (!allowed[current].includes(next)) {
      throw new ConflictException(
        `No se permite cambiar el mantenimiento de ${current} a ${next}.`,
      );
    }
  }

  private assertClosureFields(dto: UpdateMaintenanceStatusDto): void {
    if (dto.status === MaintenanceStatus.COMPLETED) {
      if (
        dto.workPerformed === undefined ||
        dto.finalCost === undefined ||
        dto.completedAt === undefined ||
        dto.finalMileage === undefined
      ) {
        throw new BadRequestException(
          'Para completar el mantenimiento se requiere trabajo realizado, costo final, fecha de finalización y kilometraje final.',
        );
      }
      return;
    }

    if (
      dto.workPerformed !== undefined ||
      dto.finalCost !== undefined ||
      dto.completedAt !== undefined ||
      dto.finalMileage !== undefined
    ) {
      throw new BadRequestException(
        'Los datos de cierre solo se aceptan al completar el mantenimiento.',
      );
    }
  }
}
