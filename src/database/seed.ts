import { NestFactory } from '@nestjs/core';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { AppModule } from '../app.module.js';
import { User, UserRole } from '../auth/entities/user.entity.js';
import {
  Maintenance,
  MaintenanceStatus,
  MaintenanceType,
} from '../maintenances/entities/maintenance.entity.js';
import {
  Mechanic,
  MechanicStatus,
} from '../mechanics/entities/mechanic.entity.js';
import { Vehicle, VehicleStatus } from '../vehicles/entities/vehicle.entity.js';
import {
  Workshop,
  WorkshopStatus,
} from '../workshops/entities/workshop.entity.js';

const SEED_PASSWORD = 'FleetCoreDemo123';
const BCRYPT_ROUNDS = 12;

async function seed(): Promise<void> {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn'],
  });

  try {
    const dataSource = app.get(DataSource);
    await dataSource.transaction(async (manager) => {
      const mechanicRepository = manager.getRepository(Mechanic);
      const workshopRepository = manager.getRepository(Workshop);
      const vehicleRepository = manager.getRepository(Vehicle);
      const userRepository = manager.getRepository(User);
      const maintenanceRepository = manager.getRepository(Maintenance);

      // Reuse records by their natural keys so running the seed repeatedly is safe.
      const saveMechanic = async (data: Partial<Mechanic>) => {
        let mechanic = await mechanicRepository.findOneBy({
          email: data.email!,
        });
        if (mechanic) Object.assign(mechanic, data);
        else mechanic = mechanicRepository.create(data);
        return mechanicRepository.save(mechanic);
      };

      const mechanic1 = await saveMechanic({
        fullName: 'Laura Gómez',
        email: 'laura.gomez@fleetcore.test',
        specialty: 'Mantenimiento preventivo',
        status: MechanicStatus.ACTIVE,
      });
      const mechanic2 = await saveMechanic({
        fullName: 'Carlos Ruiz',
        email: 'carlos.ruiz@fleetcore.test',
        specialty: 'Diagnóstico automotriz',
        status: MechanicStatus.ACTIVE,
      });
      await saveMechanic({
        fullName: 'Marta Díaz',
        email: 'marta.diaz@fleetcore.test',
        specialty: 'Sistema eléctrico',
        status: MechanicStatus.INACTIVE,
      });

      const saveWorkshop = async (data: Partial<Workshop>) => {
        let workshop = await workshopRepository.findOneBy({ name: data.name! });
        if (workshop) Object.assign(workshop, data);
        else workshop = workshopRepository.create(data);
        return workshopRepository.save(workshop);
      };

      const workshop1 = await saveWorkshop({
        name: 'Taller Central FleetCore',
        address: 'Calle 10 # 20-30, Bogotá',
        status: WorkshopStatus.ACTIVE,
      });
      await saveWorkshop({
        name: 'Taller Norte FleetCore',
        address: 'Carrera 7 # 150-20, Bogotá',
        status: WorkshopStatus.INACTIVE,
      });

      const saveVehicle = async (data: Partial<Vehicle>) => {
        let vehicle = await vehicleRepository.findOneBy({ plate: data.plate! });
        if (vehicle) Object.assign(vehicle, data);
        else vehicle = vehicleRepository.create(data);
        return vehicleRepository.save(vehicle);
      };

      const vehicle1 = await saveVehicle({
        plate: 'FLC001',
        brand: 'Toyota',
        model: 'Hilux',
        year: 2022,
        mileage: 10500,
        status: VehicleStatus.AVAILABLE,
      });
      await saveVehicle({
        plate: 'FLC002',
        brand: 'Chevrolet',
        model: 'NPR',
        year: 2021,
        mileage: 28000,
        status: VehicleStatus.AVAILABLE,
      });
      const vehicle3 = await saveVehicle({
        plate: 'FLC003',
        brand: 'Ford',
        model: 'Ranger',
        year: 2023,
        mileage: 12500,
        status: VehicleStatus.IN_MAINTENANCE,
      });
      await saveVehicle({
        plate: 'FLC004',
        brand: 'Renault',
        model: 'Kangoo',
        year: 2020,
        mileage: 40000,
        status: VehicleStatus.INACTIVE,
      });

      const passwordHash = await bcrypt.hash(SEED_PASSWORD, BCRYPT_ROUNDS);
      const saveUser = async (
        email: string,
        role: UserRole,
        mechanic?: Mechanic,
      ) => {
        let user = await userRepository.findOne({
          where: { email },
          relations: { mechanic: true },
        });
        if (!user) user = userRepository.create({ email, role });
        user.role = role;
        user.passwordHash = passwordHash;
        user.mechanic = mechanic ?? null;
        await userRepository.save(user);
      };

      await saveUser('admin@fleetcore.test', UserRole.ADMIN);
      await saveUser('tecnico1@fleetcore.test', UserRole.TECHNICIAN, mechanic1);
      await saveUser('tecnico2@fleetcore.test', UserRole.TECHNICIAN, mechanic2);

      const now = new Date();
      const completedStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const completedEnd = new Date(
        completedStart.getTime() + 2 * 60 * 60 * 1000,
      );
      const inProgressStart = new Date(now.getTime() - 60 * 60 * 1000);
      const inProgressEnd = new Date(now.getTime() + 60 * 60 * 1000);

      const saveMaintenance = async (data: Partial<Maintenance>) => {
        let maintenance = await maintenanceRepository.findOne({
          where: {
            description: data.description,
            vehicle: { id: data.vehicle!.id },
          },
        });
        if (maintenance) Object.assign(maintenance, data);
        else maintenance = maintenanceRepository.create(data);
        await maintenanceRepository.save(maintenance);
      };

      await saveMaintenance({
        type: MaintenanceType.PREVENTIVE,
        description: 'Seed: mantenimiento preventivo completado FLC001',
        mileage: 10000,
        scheduledDate: completedStart,
        scheduledEndDate: completedEnd,
        status: MaintenanceStatus.COMPLETED,
        workPerformed: 'Cambio de aceite y revisión general.',
        finalCost: 350000,
        completedAt: completedEnd,
        finalMileage: 10500,
        vehicle: vehicle1,
        mechanic: mechanic2,
        workshop: workshop1,
      });

      await saveMaintenance({
        type: MaintenanceType.CORRECTIVE,
        description: 'Seed: mantenimiento en proceso FLC003',
        mileage: 12500,
        scheduledDate: inProgressStart,
        scheduledEndDate: inProgressEnd,
        status: MaintenanceStatus.IN_PROGRESS,
        workPerformed: null,
        finalCost: null,
        completedAt: null,
        finalMileage: null,
        vehicle: vehicle3,
        mechanic: mechanic1,
        workshop: workshop1,
      });
    });

    console.log('Seeder ejecutado correctamente.');
    console.log('Admin: admin@fleetcore.test / FleetCoreDemo123');
    console.log('Técnico 1: tecnico1@fleetcore.test / FleetCoreDemo123');
    console.log('Técnico 2: tecnico2@fleetcore.test / FleetCoreDemo123');
  } finally {
    await app.close();
  }
}

seed().catch((error: unknown) => {
  console.error('No se pudo ejecutar el seeder:', error);
  process.exitCode = 1;
});
