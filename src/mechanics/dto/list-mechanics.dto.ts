import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { MechanicStatus } from '../entities/mechanic.entity.js';

export class ListMechanicsDto {
  @ApiPropertyOptional({ enum: MechanicStatus })
  @IsOptional()
  @IsEnum(MechanicStatus)
  status?: MechanicStatus;
}
