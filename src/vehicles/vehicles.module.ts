import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module.js';
import { Maintenance } from '../maintenances/entities/maintenance.entity.js';
import { VehicleIntegrationDao } from './dao/vehicle-integration.dao.js';
import { VehicleDao } from './dao/vehicle.dao.js';
import { Vehicle } from './entities/vehicle.entity.js';
import { VehiclesController } from './vehicles.controller.js';
import { VehiclesService } from './vehicles.service.js';

@Module({
  imports: [AuthModule, TypeOrmModule.forFeature([Vehicle, Maintenance])],
  controllers: [VehiclesController],
  providers: [VehiclesService, VehicleDao, VehicleIntegrationDao],
})
export class VehiclesModule {}
