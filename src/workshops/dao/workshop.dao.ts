import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Workshop, WorkshopStatus } from '../entities/workshop.entity.js';

@Injectable()
export class WorkshopDao {
  constructor(
    @InjectRepository(Workshop)
    private readonly repository: Repository<Workshop>,
  ) {}

  create(data: Partial<Workshop>): Workshop {
    return this.repository.create(data);
  }

  save(workshop: Workshop): Promise<Workshop> {
    return this.repository.save(workshop);
  }

  findAll(status: WorkshopStatus): Promise<Workshop[]> {
    return this.repository.find({ where: { status }, order: { id: 'ASC' } });
  }

  findById(id: number): Promise<Workshop | null> {
    return this.repository.findOneBy({ id });
  }
}
