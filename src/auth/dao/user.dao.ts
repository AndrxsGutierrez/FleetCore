import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Mechanic } from '../../mechanics/entities/mechanic.entity.js';
import { User, UserRole } from '../entities/user.entity.js';

@Injectable()
export class UserDao {
  constructor(
    @InjectRepository(User)
    private readonly repository: Repository<User>,
    @InjectRepository(Mechanic)
    private readonly mechanicRepository: Repository<Mechanic>,
  ) {}

  findByEmail(
    email: string,
    includePasswordHash = false,
  ): Promise<User | null> {
    const query = this.repository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.mechanic', 'mechanic')
      .where('user.email = :email', {
        email,
      });
    if (includePasswordHash) query.addSelect('user.passwordHash');
    return query.getOne();
  }

  findMechanicById(id: number): Promise<Mechanic | null> {
    return this.mechanicRepository.findOneBy({ id });
  }

  findUserByMechanicId(mechanicId: number): Promise<User | null> {
    return this.repository
      .createQueryBuilder('user')
      .innerJoin('user.mechanic', 'mechanic')
      .where('mechanic.id = :mechanicId', { mechanicId })
      .getOne();
  }

  create(data: {
    email: string;
    passwordHash: string;
    role: UserRole;
    mechanic?: Mechanic;
  }): User {
    return this.repository.create(data);
  }

  save(user: User): Promise<User> {
    return this.repository.save(user);
  }
}
