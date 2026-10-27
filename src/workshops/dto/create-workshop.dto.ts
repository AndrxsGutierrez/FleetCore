import { Transform } from 'class-transformer';
import { IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateWorkshopDto {
  @ApiProperty({ example: 'Taller Central' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @Length(1, 120)
  name!: string;

  @ApiProperty({ example: 'Calle 10 # 20-30, Bogotá' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @Length(1, 250)
  address!: string;
}
