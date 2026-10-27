import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import type { AuthenticatedUser } from '../auth/authenticated-user.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { UserRole } from '../auth/entities/user.entity.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { CreateMaintenanceDto } from './dto/create-maintenance.dto.js';
import { ListMaintenancesDto } from './dto/list-maintenances.dto.js';
import { UpdateMaintenanceStatusDto } from './dto/update-maintenance-status.dto.js';
import { MaintenanceStatus } from './entities/maintenance.entity.js';
import { MaintenancesService } from './maintenances.service.js';

@ApiTags('Mantenimientos')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('maintenances')
export class MaintenancesController {
  constructor(private readonly maintenancesService: MaintenancesService) {}

  @Post()
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Programar un mantenimiento para vehículo, mecánico y taller',
  })
  @ApiCreatedResponse({ description: 'Mantenimiento programado.' })
  @ApiNotFoundResponse({
    description: 'No existe el vehículo, mecánico o taller indicado.',
  })
  create(@Body() dto: CreateMaintenanceDto) {
    return this.maintenancesService.create(dto);
  }

  @Get()
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Listar mantenimientos; permite filtrar por estado',
  })
  @ApiOkResponse({ description: 'Lista de mantenimientos con sus relaciones.' })
  findAll(@Query() query: ListMaintenancesDto) {
    return this.maintenancesService.findAll(query);
  }

  @Get('active')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Listar mantenimientos programados o en proceso' })
  @ApiOkResponse({ description: 'Lista de mantenimientos activos.' })
  findActive() {
    return this.maintenancesService.findActive();
  }

  @Get('vehicle/:vehicleId/history')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Consultar el historial de mantenimientos de un vehículo',
  })
  @ApiParam({ name: 'vehicleId', type: Number })
  @ApiOkResponse({
    description: 'Historial ordenado por fecha programada descendente.',
  })
  findHistoryByVehicle(@Param('vehicleId', ParseIntPipe) vehicleId: number) {
    return this.maintenancesService.findHistoryByVehicle(vehicleId);
  }

  @Get('vehicle/:vehicleId')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Listar mantenimientos de un vehículo' })
  @ApiParam({ name: 'vehicleId', type: Number })
  @ApiOkResponse({ description: 'Mantenimientos asociados al vehículo.' })
  findByVehicle(@Param('vehicleId', ParseIntPipe) vehicleId: number) {
    return this.maintenancesService.findByVehicle(vehicleId);
  }

  @Get('mechanic/:mechanicId')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Listar mantenimientos asignados a un mecánico' })
  @ApiParam({ name: 'mechanicId', type: Number })
  @ApiOkResponse({ description: 'Mantenimientos asignados al mecánico.' })
  findByMechanic(@Param('mechanicId', ParseIntPipe) mechanicId: number) {
    return this.maintenancesService.findByMechanic(mechanicId);
  }

  @Get('assigned-to-me')
  @ApiBearerAuth()
  @Roles(UserRole.TECHNICIAN)
  @ApiOperation({
    summary: 'Listar los mantenimientos del mecánico vinculado al técnico',
  })
  @ApiOkResponse({
    description: 'Mantenimientos asignados al usuario autenticado.',
  })
  findAssignedToMe(@CurrentUser() user: AuthenticatedUser) {
    return this.maintenancesService.findAssignedToUser(user);
  }

  @Get(':id')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN, UserRole.TECHNICIAN)
  @ApiOperation({ summary: 'Consultar un mantenimiento por identificador' })
  @ApiParam({ name: 'id', type: Number })
  @ApiOkResponse({ description: 'Mantenimiento encontrado.' })
  @ApiNotFoundResponse({
    description: 'No existe un mantenimiento con ese identificador.',
  })
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.maintenancesService.findOneForUser(id, user);
  }

  @Patch(':id/status')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN, UserRole.TECHNICIAN)
  @ApiOperation({ summary: 'Avanzar el estado de un mantenimiento' })
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({
    type: UpdateMaintenanceStatusDto,
    examples: {
      iniciar: {
        summary: 'Iniciar el trabajo',
        value: { status: MaintenanceStatus.IN_PROGRESS },
      },
      cancelar: {
        summary: 'Cancelar el mantenimiento',
        value: { status: MaintenanceStatus.CANCELLED },
      },
      completar: {
        summary: 'Completar e informar el cierre',
        value: {
          status: MaintenanceStatus.COMPLETED,
          workPerformed: 'Se cambió el aceite y el filtro.',
          finalCost: 450000,
          completedAt: '2026-11-02T09:00:00-05:00',
          finalMileage: 42050,
        },
      },
    },
  })
  @ApiOkResponse({ description: 'Estado del mantenimiento actualizado.' })
  @ApiBadRequestResponse({
    description: 'Faltan datos de cierre o la solicitud es inválida.',
  })
  @ApiConflictResponse({
    description: 'La transición o una regla de negocio no está permitida.',
  })
  @ApiNotFoundResponse({ description: 'No existe el mantenimiento indicado.' })
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateMaintenanceStatusDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.maintenancesService.updateStatus(id, dto, user);
  }
}
