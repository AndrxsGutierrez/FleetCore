import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Min,
  ValidateIf,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MaintenanceStatus } from '../entities/maintenance.entity.js';

export class UpdateMaintenanceStatusDto {
  @ApiProperty({
    enum: MaintenanceStatus,
    example: MaintenanceStatus.IN_PROGRESS,
  })
  @IsEnum(MaintenanceStatus)
  status!: MaintenanceStatus;

  @ApiPropertyOptional({ example: 'Se cambió el aceite y el filtro.' })
  @ValidateIf(
    (dto: UpdateMaintenanceStatusDto) =>
      dto.status === MaintenanceStatus.COMPLETED,
  )
  @IsString()
  @Length(1, 5000)
  workPerformed?: string;

  @ApiPropertyOptional({ example: 450000, minimum: 0 })
  @ValidateIf(
    (dto: UpdateMaintenanceStatusDto) =>
      dto.status === MaintenanceStatus.COMPLETED,
  )
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  finalCost?: number;

  @ApiPropertyOptional({ example: '2026-11-02T09:00:00-05:00' })
  @ValidateIf(
    (dto: UpdateMaintenanceStatusDto) =>
      dto.status === MaintenanceStatus.COMPLETED,
  )
  @IsDateString()
  completedAt?: string;

  @ApiPropertyOptional({ example: 42050, minimum: 0 })
  @ValidateIf(
    (dto: UpdateMaintenanceStatusDto) =>
      dto.status === MaintenanceStatus.COMPLETED,
  )
  @Type(() => Number)
  @IsInt()
  @Min(0)
  finalMileage?: number;
}
