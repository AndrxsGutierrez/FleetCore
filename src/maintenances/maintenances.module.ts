import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MaintenanceDao } from './dao/maintenance.dao.js';
import { Maintenance } from './entities/maintenance.entity.js';
import { MaintenancesController } from './maintenances.controller.js';
import { MaintenancesService } from './maintenances.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([Maintenance])],
  controllers: [MaintenancesController],
  providers: [MaintenancesService, MaintenanceDao],
})
export class MaintenancesModule {}
