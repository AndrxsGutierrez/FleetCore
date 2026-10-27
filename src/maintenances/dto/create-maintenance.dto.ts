import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsString,
  Length,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { MaintenanceType } from '../entities/maintenance.entity.js';

export class CreateMaintenanceDto {
  @ApiProperty({ enum: MaintenanceType, example: MaintenanceType.PREVENTIVE })
  @IsEnum(MaintenanceType)
  type!: MaintenanceType;

  @ApiProperty({ example: 'Cambio de aceite y revisión general' })
  @IsString()
  @Length(1, 5000)
  description!: string;

  @ApiProperty({ example: 42000, minimum: 0 })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  mileage!: number;

  @ApiProperty({ example: '2026-11-02T07:30:00-05:00' })
  @IsDateString()
  scheduledDate!: string;

  @ApiProperty({ example: '2026-11-02T09:00:00-05:00' })
  @IsDateString()
  scheduledEndDate!: string;

  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  vehicleId!: number;

  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  mechanicId!: number;

  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  workshopId!: number;
}
