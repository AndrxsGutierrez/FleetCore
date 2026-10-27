import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { QueryFailedError } from 'typeorm';
import { CreateVehicleDto } from './dto/create-vehicle.dto.js';
import { ListVehiclesDto } from './dto/list-vehicles.dto.js';
import { UpdateVehicleDto } from './dto/update-vehicle.dto.js';
import { Vehicle, VehicleStatus } from './entities/vehicle.entity.js';
import { VehicleDao } from './dao/vehicle.dao.js';

@Injectable()
export class VehiclesService {
  constructor(private readonly vehicleDao: VehicleDao) {}

  findAll(query: ListVehiclesDto): Promise<Vehicle[]> {
    return this.vehicleDao.findAll(query.status);
  }

  async findOne(id: number): Promise<Vehicle> {
    const vehicle = await this.vehicleDao.findById(id);
    if (!vehicle) throw new NotFoundException(`No existe un vehículo con identificador ${id}.`);
    return vehicle;
  }

  async findByPlate(plate: string): Promise<Vehicle> {
    const vehicle = await this.vehicleDao.findByPlate(plate.trim().toUpperCase());
    if (!vehicle) throw new NotFoundException(`No existe un vehículo con placa ${plate}.`);
    return vehicle;
  }

  async create(dto: CreateVehicleDto): Promise<Vehicle> {
    const plate = dto.plate.trim().toUpperCase();
    if (await this.vehicleDao.plateInUse(plate)) {
      throw new ConflictException(`Ya existe un vehículo registrado con la placa ${plate}.`);
    }

    return this.saveOrThrowConflict(
      this.vehicleDao.create({ ...dto, plate, mileage: dto.mileage ?? 0 }),
    );
  }

  async update(id: number, dto: UpdateVehicleDto): Promise<Vehicle> {
    const vehicle = await this.findOne(id);

    if (dto.plate) {
      dto.plate = dto.plate.trim().toUpperCase();
      if (await this.vehicleDao.plateInUse(dto.plate, id)) {
        throw new ConflictException(`Ya existe un vehículo registrado con la placa ${dto.plate}.`);
      }
    }

    Object.assign(vehicle, dto);
    return this.saveOrThrowConflict(vehicle);
  }

  async deactivate(id: number): Promise<Vehicle> {
    const vehicle = await this.findOne(id);
    if (vehicle.status === VehicleStatus.IN_MAINTENANCE) {
      throw new ConflictException('No se puede inactivar un vehículo que está en mantenimiento.');
    }
    vehicle.status = VehicleStatus.INACTIVE;
    return this.vehicleDao.save(vehicle);
  }

  async activate(id: number): Promise<Vehicle> {
    const vehicle = await this.findOne(id);
    if (vehicle.status === VehicleStatus.IN_MAINTENANCE) {
      throw new ConflictException('El vehículo ya está en mantenimiento.');
    }
    vehicle.status = VehicleStatus.AVAILABLE;
    return this.vehicleDao.save(vehicle);
  }

  private async saveOrThrowConflict(vehicle: Vehicle): Promise<Vehicle> {
    try {
      return await this.vehicleDao.save(vehicle);
    } catch (error) {
      if (error instanceof QueryFailedError && (error.driverError as { code?: string }).code === '23505') {
        throw new ConflictException(`Ya existe un vehículo registrado con la placa ${vehicle.plate}.`);
      }
      throw error;
    }
  }
}
