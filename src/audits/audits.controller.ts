import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { UserRole } from '../auth/entities/user.entity.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { ListAuditsDto } from './dto/list-audits.dto.js';
import { AuditsService } from './audits.service.js';

@ApiTags('Auditorías')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('audits')
export class AuditsController {
  constructor(private readonly auditsService: AuditsService) {}

  @Get()
  @ApiOperation({ summary: 'Consultar acciones auditadas; solo ADMIN' })
  @ApiOkResponse({
    description: 'Acciones ordenadas de más reciente a más antigua.',
  })
  findAll(@Query() query: ListAuditsDto) {
    return this.auditsService.findAll(query);
  }
}
