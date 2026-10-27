import { Injectable, NotFoundException } from '@nestjs/common';
import { WorkshopDao } from './dao/workshop.dao.js';
import { CreateWorkshopDto } from './dto/create-workshop.dto.js';
import { ListWorkshopsDto } from './dto/list-workshops.dto.js';
import { UpdateWorkshopDto } from './dto/update-workshop.dto.js';
import { Workshop, WorkshopStatus } from './entities/workshop.entity.js';

@Injectable()
export class WorkshopsService {
  constructor(private readonly workshopDao: WorkshopDao) {}

  findAll(query: ListWorkshopsDto): Promise<Workshop[]> {
    return this.workshopDao.findAll(query.status ?? WorkshopStatus.ACTIVE);
  }

  async findOne(id: number): Promise<Workshop> {
    const workshop = await this.workshopDao.findById(id);
    if (!workshop) throw new NotFoundException(`No existe un taller con identificador ${id}.`);
    return workshop;
  }

  create(dto: CreateWorkshopDto): Promise<Workshop> {
    return this.workshopDao.save(this.workshopDao.create(dto));
  }

  async update(id: number, dto: UpdateWorkshopDto): Promise<Workshop> {
    const workshop = await this.findOne(id);
    Object.assign(workshop, dto);
    return this.workshopDao.save(workshop);
  }

  async deactivate(id: number): Promise<Workshop> {
    const workshop = await this.findOne(id);
    workshop.status = WorkshopStatus.INACTIVE;
    return this.workshopDao.save(workshop);
  }

  async activate(id: number): Promise<Workshop> {
    const workshop = await this.findOne(id);
    workshop.status = WorkshopStatus.ACTIVE;
    return this.workshopDao.save(workshop);
  }
}
