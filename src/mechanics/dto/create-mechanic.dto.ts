import { Transform } from 'class-transformer';
import { IsEmail, IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMechanicDto {
  @ApiProperty({ example: 'Laura Gómez' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @Length(1, 120)
  fullName!: string;

  @ApiProperty({ example: 'laura.gomez@fleetcore.test' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  @IsEmail()
  @Length(1, 160)
  email!: string;

  @ApiProperty({ example: 'Sistemas de frenos' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @Length(1, 100)
  specialty!: string;
}
