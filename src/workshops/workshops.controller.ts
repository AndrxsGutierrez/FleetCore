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
import { CreateWorkshopDto } from './dto/create-workshop.dto.js';
import { ListWorkshopsDto } from './dto/list-workshops.dto.js';
import { UpdateWorkshopDto } from './dto/update-workshop.dto.js';
import { WorkshopsService } from './workshops.service.js';

@ApiTags('Talleres')
@Controller('workshops')
export class WorkshopsController {
  constructor(private readonly workshopsService: WorkshopsService) {}

  @Post()
  @ApiOperation({ summary: 'Registrar un taller' })
  @ApiCreatedResponse({ description: 'Taller registrado.' })
  create(@Body() dto: CreateWorkshopDto) {
    return this.workshopsService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar talleres activos; permite filtrar por estado' })
  @ApiOkResponse({ description: 'Lista de talleres.' })
  findAll(@Query() query: ListWorkshopsDto) {
    return this.workshopsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Consultar un taller por identificador' })
  @ApiParam({ name: 'id', type: Number })
  @ApiOkResponse({ description: 'Taller encontrado.' })
  @ApiNotFoundResponse({ description: 'No existe un taller con ese identificador.' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.workshopsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar los datos de un taller' })
  @ApiParam({ name: 'id', type: Number })
  @ApiOkResponse({ description: 'Taller actualizado.' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateWorkshopDto) {
    return this.workshopsService.update(id, dto);
  }

  @Patch(':id/deactivate')
  @ApiOperation({ summary: 'Inactivar un taller sin eliminar su historial' })
  @ApiParam({ name: 'id', type: Number })
  @ApiOkResponse({ description: 'Taller inactivado.' })
  deactivate(@Param('id', ParseIntPipe) id: number) {
    return this.workshopsService.deactivate(id);
  }

  @Patch(':id/activate')
  @ApiOperation({ summary: 'Activar un taller' })
  @ApiParam({ name: 'id', type: Number })
  @ApiOkResponse({ description: 'Taller activado.' })
  activate(@Param('id', ParseIntPipe) id: number) {
    return this.workshopsService.activate(id);
  }
}
