import { Transform } from 'class-transformer';
import { IsInt, IsOptional, IsString, Length, Max, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateVehicleDto {
  @ApiProperty({ example: 'ABC123' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toUpperCase() : value))
  @IsString()
  @Length(4, 12)
  plate!: string;

  @ApiProperty({ example: 'Toyota' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @Length(1, 80)
  brand!: string;

  @ApiProperty({ example: 'Hilux' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @Length(1, 80)
  model!: string;

  @ApiProperty({ example: 2022, minimum: 1900 })
  @IsInt()
  @Min(1900)
  @Max(2100)
  year!: number;

  @ApiPropertyOptional({ example: 25000, minimum: 0, default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  mileage?: number;
}
