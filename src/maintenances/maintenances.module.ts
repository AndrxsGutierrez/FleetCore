import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module.js';
import { MaintenanceDao } from './dao/maintenance.dao.js';
import { Maintenance } from './entities/maintenance.entity.js';
import { MaintenancesController } from './maintenances.controller.js';
import { MaintenancesService } from './maintenances.service.js';

@Module({
  imports: [AuthModule, TypeOrmModule.forFeature([Maintenance])],
  controllers: [MaintenancesController],
  providers: [MaintenancesService, MaintenanceDao],
})
export class MaintenancesModule {}
