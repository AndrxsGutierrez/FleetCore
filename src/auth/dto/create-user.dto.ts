import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDefined, IsEnum, IsInt, Min, ValidateIf } from 'class-validator';
import { RegisterDto } from './register.dto.js';
import { UserRole } from '../entities/user.entity.js';

export class CreateUserDto extends RegisterDto {
  @ApiProperty({ enum: UserRole, example: UserRole.TECHNICIAN })
  @IsEnum(UserRole)
  role!: UserRole;

  @ApiPropertyOptional({
    example: 1,
    description: 'Obligatorio para TECHNICIAN; no aplica a ADMIN.',
  })
  @ValidateIf((user: CreateUserDto) => user.role === UserRole.TECHNICIAN)
  @IsDefined({ message: 'mechanicId es obligatorio para usuarios TECHNICIAN.' })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  mechanicId?: number;
}
