import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { CreateVehicleDto } from './dto/create-vehicle.dto.js';
import { ListVehiclesDto } from './dto/list-vehicles.dto.js';
import { UpdateVehicleDto } from './dto/update-vehicle.dto.js';
import { VehiclesService } from './vehicles.service.js';

@ApiTags('Vehículos')
@Controller('vehicles')
export class VehiclesController {
  constructor(private readonly vehiclesService: VehiclesService) {}

  @Post()
  @ApiOperation({ summary: 'Registrar un vehículo' })
  @ApiCreatedResponse({ description: 'Vehículo registrado.' })
  create(@Body() dto: CreateVehicleDto) {
    return this.vehiclesService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar vehículos, opcionalmente filtrados por estado' })
  @ApiOkResponse({ description: 'Lista de vehículos.' })
  findAll(@Query() query: ListVehiclesDto) {
    return this.vehiclesService.findAll(query);
  }

  @Get('plate/:plate')
  @ApiOperation({ summary: 'Consultar un vehículo por placa' })
  @ApiParam({ name: 'plate', example: 'ABC123' })
  @ApiOkResponse({ description: 'Vehículo encontrado.' })
  @ApiNotFoundResponse({ description: 'No existe un vehículo con esa placa.' })
  findByPlate(@Param('plate') plate: string) {
    return this.vehiclesService.findByPlate(plate);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Consultar un vehículo por identificador' })
  @ApiParam({ name: 'id', type: Number })
  @ApiOkResponse({ description: 'Vehículo encontrado.' })
  @ApiNotFoundResponse({ description: 'No existe un vehículo con ese identificador.' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.vehiclesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar los datos de un vehículo' })
  @ApiParam({ name: 'id', type: Number })
  @ApiOkResponse({ description: 'Vehículo actualizado.' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateVehicleDto) {
    return this.vehiclesService.update(id, dto);
  }

  @Patch(':id/deactivate')
  @ApiOperation({ summary: 'Inactivar un vehículo sin eliminar su registro' })
  @ApiParam({ name: 'id', type: Number })
  @ApiOkResponse({ description: 'Vehículo inactivado.' })
  deactivate(@Param('id', ParseIntPipe) id: number) {
    return this.vehiclesService.deactivate(id);
  }

  @Patch(':id/activate')
  @ApiOperation({ summary: 'Activar un vehículo' })
  @ApiParam({ name: 'id', type: Number })
  @ApiOkResponse({ description: 'Vehículo activado.' })
  activate(@Param('id', ParseIntPipe) id: number) {
    return this.vehiclesService.activate(id);
  }
}
