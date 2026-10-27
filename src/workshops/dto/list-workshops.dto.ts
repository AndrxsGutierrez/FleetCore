import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { WorkshopStatus } from '../entities/workshop.entity.js';

export class ListWorkshopsDto {
  @ApiPropertyOptional({ enum: WorkshopStatus, default: WorkshopStatus.ACTIVE })
  @IsOptional()
  @IsEnum(WorkshopStatus)
  status?: WorkshopStatus;
}
