import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { QueryFailedError } from 'typeorm';
import { MechanicDao } from './dao/mechanic.dao.js';
import { CreateMechanicDto } from './dto/create-mechanic.dto.js';
import { ListMechanicsDto } from './dto/list-mechanics.dto.js';
import { UpdateMechanicDto } from './dto/update-mechanic.dto.js';
import { Mechanic, MechanicStatus } from './entities/mechanic.entity.js';

@Injectable()
export class MechanicsService {
  constructor(private readonly mechanicDao: MechanicDao) {}

  findAll(query: ListMechanicsDto): Promise<Mechanic[]> {
    return this.mechanicDao.findAll(query.status);
  }

  async findOne(id: number): Promise<Mechanic> {
    const mechanic = await this.mechanicDao.findById(id);
    if (!mechanic) throw new NotFoundException(`No existe un mecánico con identificador ${id}.`);
    return mechanic;
  }

  async create(dto: CreateMechanicDto): Promise<Mechanic> {
    const email = dto.email.trim().toLowerCase();
    if (await this.mechanicDao.findByEmail(email)) {
      throw new ConflictException(`Ya existe un mecánico registrado con el correo ${email}.`);
    }

    const mechanic = this.mechanicDao.create({ ...dto, email });
    return this.saveOrThrowEmailConflict(mechanic);
  }

  async update(id: number, dto: UpdateMechanicDto): Promise<Mechanic> {
    const mechanic = await this.findOne(id);
    if (dto.email !== undefined) {
      dto.email = dto.email.trim().toLowerCase();
      const existing = await this.mechanicDao.findByEmail(dto.email);
      if (existing && existing.id !== id) {
        throw new ConflictException(`Ya existe un mecánico registrado con el correo ${dto.email}.`);
      }
    }

    Object.assign(mechanic, dto);
    return this.saveOrThrowEmailConflict(mechanic);
  }

  async deactivate(id: number): Promise<Mechanic> {
    const mechanic = await this.findOne(id);
    mechanic.status = MechanicStatus.INACTIVE;
    return this.mechanicDao.save(mechanic);
  }

  async activate(id: number): Promise<Mechanic> {
    const mechanic = await this.findOne(id);
    mechanic.status = MechanicStatus.ACTIVE;
    return this.mechanicDao.save(mechanic);
  }

  private async saveOrThrowEmailConflict(mechanic: Mechanic): Promise<Mechanic> {
    try {
      return await this.mechanicDao.save(mechanic);
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        (error.driverError as { code?: string }).code === '23505'
      ) {
        throw new ConflictException(`Ya existe un mecánico registrado con el correo ${mechanic.email}.`);
      }
      throw error;
    }
  }
}
