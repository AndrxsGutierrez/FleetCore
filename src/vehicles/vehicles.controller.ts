import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import { CreateVehicleDto } from './dto/create-vehicle.dto.js';
import { ListVehiclesDto } from './dto/list-vehicles.dto.js';
import { UpdateVehicleDto } from './dto/update-vehicle.dto.js';
import { VehiclesService } from './vehicles.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { UserRole } from '../auth/entities/user.entity.js';
import { ApiKeyGuard } from '../auth/guards/api-key.guard.js';
import { Public } from '../auth/decorators/public.decorator.js';

@ApiTags('Vehículos')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('vehicles')
export class VehiclesController {
  constructor(private readonly vehiclesService: VehiclesService) {}

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Registrar un vehículo' })
  @ApiCreatedResponse({ description: 'Vehículo registrado.' })
  create(@Body() dto: CreateVehicleDto) {
    return this.vehiclesService.create(dto);
  }

  @Get()
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Listar vehículos, opcionalmente filtrados por estado',
  })
  @ApiOkResponse({ description: 'Lista de vehículos.' })
  findAll(@Query() query: ListVehiclesDto) {
    return this.vehiclesService.findAll(query);
  }

  @Get('plate/:plate')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Consultar un vehículo por placa' })
  @ApiParam({ name: 'plate', example: 'ABC123' })
  @ApiOkResponse({ description: 'Vehículo encontrado.' })
  @ApiNotFoundResponse({ description: 'No existe un vehículo con esa placa.' })
  findByPlate(@Param('plate') plate: string) {
    return this.vehiclesService.findByPlate(plate);
  }

  // This integration endpoint bypasses JWT and ADMIN checks; its API key guard is required.
  @Get(':id/external-summary')
  @Public()
  @Roles()
  @UseGuards(ApiKeyGuard)
  @ApiSecurity('x-api-key')
  @ApiOperation({
    summary:
      'Consultar disponibilidad e historial de un vehículo para integraciones',
  })
  @ApiParam({ name: 'id', type: Number })
  @ApiOkResponse({ description: 'Vehículo y su historial de mantenimientos.' })
  @ApiNotFoundResponse({
    description: 'No existe un vehículo con ese identificador.',
  })
  findExternalSummary(@Param('id', ParseIntPipe) id: number) {
    return this.vehiclesService.findExternalSummary(id);
  }

  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Consultar un vehículo por identificador' })
  @ApiParam({ name: 'id', type: Number })
  @ApiOkResponse({ description: 'Vehículo encontrado.' })
  @ApiNotFoundResponse({
    description: 'No existe un vehículo con ese identificador.',
  })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.vehiclesService.findOne(id);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar los datos de un vehículo' })
  @ApiParam({ name: 'id', type: Number })
  @ApiOkResponse({ description: 'Vehículo actualizado.' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateVehicleDto) {
    return this.vehiclesService.update(id, dto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Inactivar un vehículo sin borrar su registro ni historial',
  })
  @ApiParam({ name: 'id', type: Number })
  @ApiOkResponse({ description: 'Vehículo inactivado.' })
  deactivate(@Param('id', ParseIntPipe) id: number) {
    return this.vehiclesService.deactivate(id);
  }

  @Patch(':id/activate')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Activar un vehículo' })
  @ApiParam({ name: 'id', type: Number })
  @ApiOkResponse({ description: 'Vehículo activado.' })
  activate(@Param('id', ParseIntPipe) id: number) {
    return this.vehiclesService.activate(id);
  }
}
