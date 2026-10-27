import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { UserRole } from '../auth/entities/user.entity.js';
import type { AuthenticatedUser } from '../auth/authenticated-user.js';
import { Vehicle, VehicleStatus } from '../vehicles/entities/vehicle.entity.js';
import { MaintenanceDao } from './dao/maintenance.dao.js';
import {
  Maintenance,
  MaintenanceStatus,
} from './entities/maintenance.entity.js';
import { UpdateMaintenanceStatusDto } from './dto/update-maintenance-status.dto.js';
import { MaintenancesService } from './maintenances.service.js';

describe('MaintenancesService.updateStatus', () => {
  const manager = {} as EntityManager;
  const admin: AuthenticatedUser = {
    sub: 1,
    email: 'admin@fleetcore.test',
    role: UserRole.ADMIN,
    mechanicId: null,
  };
  const maintenanceDao = {
    transaction: vi.fn(
      (operation: (manager: EntityManager) => Promise<unknown>) =>
        operation(manager),
    ),
    lockMaintenance: vi.fn(),
    findMechanicId: vi.fn(),
    findVehicleId: vi.fn(),
    lockVehicleForStatusUpdate: vi.fn(),
    saveVehicle: vi.fn(),
    save: vi.fn(),
    findById: vi.fn(),
  };
  let service: MaintenancesService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new MaintenancesService(
      maintenanceDao as unknown as MaintenanceDao,
    );
  });

  it('rechaza una transición de SCHEDULED directamente a COMPLETED', async () => {
    maintenanceDao.lockMaintenance.mockResolvedValue({
      id: 5,
      status: MaintenanceStatus.SCHEDULED,
    } as Maintenance);

    const dto: UpdateMaintenanceStatusDto = {
      status: MaintenanceStatus.COMPLETED,
      workPerformed: 'Trabajo realizado',
      finalCost: 100,
      completedAt: '2026-10-27T12:00:00.000Z',
      finalMileage: 1000,
    };

    await expect(service.updateStatus(5, dto, admin)).rejects.toBeInstanceOf(
      ConflictException,
    );
    expect(maintenanceDao.save).not.toHaveBeenCalled();
  });

  it('requiere todos los datos de cierre al completar', async () => {
    maintenanceDao.lockMaintenance.mockResolvedValue({
      id: 5,
      status: MaintenanceStatus.IN_PROGRESS,
    } as Maintenance);

    await expect(
      service.updateStatus(5, { status: MaintenanceStatus.COMPLETED }, admin),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(maintenanceDao.findVehicleId).not.toHaveBeenCalled();
  });

  it('no permite que un técnico actualice un mantenimiento ajeno', async () => {
    maintenanceDao.lockMaintenance.mockResolvedValue({
      id: 5,
      status: MaintenanceStatus.SCHEDULED,
    } as Maintenance);
    maintenanceDao.findMechanicId.mockResolvedValue(99);
    const technician: AuthenticatedUser = {
      sub: 2,
      email: 'tecnico@fleetcore.test',
      role: UserRole.TECHNICIAN,
      mechanicId: 1,
    };

    await expect(
      service.updateStatus(
        5,
        { status: MaintenanceStatus.IN_PROGRESS },
        technician,
      ),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(maintenanceDao.findVehicleId).not.toHaveBeenCalled();
  });

  it('al completar libera el vehículo y actualiza kilometraje y cierre', async () => {
    const maintenance = {
      id: 5,
      status: MaintenanceStatus.IN_PROGRESS,
      mileage: 950,
    } as Maintenance;
    const vehicle = {
      id: 7,
      status: VehicleStatus.IN_MAINTENANCE,
      mileage: 950,
    } as Vehicle;
    maintenanceDao.lockMaintenance.mockResolvedValue(maintenance);
    maintenanceDao.findVehicleId.mockResolvedValue(vehicle.id);
    maintenanceDao.lockVehicleForStatusUpdate.mockResolvedValue(vehicle);
    maintenanceDao.saveVehicle.mockImplementation(
      async (_manager: EntityManager, value: Vehicle) => value,
    );
    maintenanceDao.save.mockImplementation(
      async (_manager: EntityManager, value: Maintenance) => value,
    );
    maintenanceDao.findById.mockResolvedValue(maintenance);

    const dto: UpdateMaintenanceStatusDto = {
      status: MaintenanceStatus.COMPLETED,
      workPerformed: 'Cambio de aceite',
      finalCost: 250000,
      completedAt: '2026-10-27T12:00:00.000Z',
      finalMileage: 1000,
    };

    const result = await service.updateStatus(maintenance.id, dto, admin);

    expect(vehicle.status).toBe(VehicleStatus.AVAILABLE);
    expect(vehicle.mileage).toBe(1000);
    expect(result.status).toBe(MaintenanceStatus.COMPLETED);
    expect(result.workPerformed).toBe('Cambio de aceite');
    expect(result.finalCost).toBe(250000);
    expect(result.finalMileage).toBe(1000);
    expect(maintenanceDao.saveVehicle).toHaveBeenCalledOnce();
  });
});
