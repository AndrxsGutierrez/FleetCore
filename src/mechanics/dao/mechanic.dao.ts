import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Mechanic, MechanicStatus } from '../entities/mechanic.entity.js';

@Injectable()
export class MechanicDao {
  constructor(
    @InjectRepository(Mechanic)
    private readonly repository: Repository<Mechanic>,
  ) {}

  create(data: Partial<Mechanic>): Mechanic {
    return this.repository.create(data);
  }

  save(mechanic: Mechanic): Promise<Mechanic> {
    return this.repository.save(mechanic);
  }

  findAll(status?: MechanicStatus): Promise<Mechanic[]> {
    return this.repository.find({
      where: status ? { status } : {},
      order: { id: 'ASC' },
    });
  }

  findById(id: number): Promise<Mechanic | null> {
    return this.repository.findOneBy({ id });
  }

  findByEmail(email: string): Promise<Mechanic | null> {
    return this.repository.findOneBy({ email });
  }
}
