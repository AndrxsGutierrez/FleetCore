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
import { CreateMechanicDto } from './dto/create-mechanic.dto.js';
import { ListMechanicsDto } from './dto/list-mechanics.dto.js';
import { UpdateMechanicDto } from './dto/update-mechanic.dto.js';
import { MechanicsService } from './mechanics.service.js';

@ApiTags('Mecánicos')
@Controller('mechanics')
export class MechanicsController {
  constructor(private readonly mechanicsService: MechanicsService) {}

  @Post()
  @ApiOperation({ summary: 'Registrar un mecánico' })
  @ApiCreatedResponse({ description: 'Mecánico registrado. Su estado inicial es ACTIVE.' })
  create(@Body() dto: CreateMechanicDto) {
    return this.mechanicsService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar mecánicos, opcionalmente filtrados por estado' })
  @ApiOkResponse({ description: 'Lista de mecánicos.' })
  findAll(@Query() query: ListMechanicsDto) {
    return this.mechanicsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Consultar un mecánico por identificador' })
  @ApiParam({ name: 'id', type: Number })
  @ApiOkResponse({ description: 'Mecánico encontrado.' })
  @ApiNotFoundResponse({ description: 'No existe un mecánico con ese identificador.' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.mechanicsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar los datos de un mecánico' })
  @ApiParam({ name: 'id', type: Number })
  @ApiOkResponse({ description: 'Mecánico actualizado.' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateMechanicDto) {
    return this.mechanicsService.update(id, dto);
  }

  @Patch(':id/deactivate')
  @ApiOperation({ summary: 'Inactivar un mecánico sin borrar su historial' })
  @ApiParam({ name: 'id', type: Number })
  @ApiOkResponse({ description: 'Mecánico inactivado.' })
  deactivate(@Param('id', ParseIntPipe) id: number) {
    return this.mechanicsService.deactivate(id);
  }

  @Patch(':id/activate')
  @ApiOperation({ summary: 'Activar un mecánico' })
  @ApiParam({ name: 'id', type: Number })
  @ApiOkResponse({ description: 'Mecánico activado.' })
  activate(@Param('id', ParseIntPipe) id: number) {
    return this.mechanicsService.activate(id);
  }
}
