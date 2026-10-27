import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MechanicDao } from './dao/mechanic.dao.js';
import { Mechanic } from './entities/mechanic.entity.js';
import { MechanicsController } from './mechanics.controller.js';
import { MechanicsService } from './mechanics.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([Mechanic])],
  controllers: [MechanicsController],
  providers: [MechanicsService, MechanicDao],
})
export class MechanicsModule {}
