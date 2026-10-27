import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  MaxLength,
  MinLength,
  Validate,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'maxBcryptPasswordBytes', async: false })
class MaxBcryptPasswordBytesConstraint implements ValidatorConstraintInterface {
  validate(value: unknown): boolean {
    return typeof value === 'string' && Buffer.byteLength(value, 'utf8') <= 72;
  }

  defaultMessage(_validationArguments: ValidationArguments): string {
    return 'La contraseña no puede superar los 72 bytes UTF-8 permitidos por bcrypt.';
  }
}

export class RegisterDto {
  @ApiProperty({ example: 'tecnico@fleetcore.test' })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsEmail()
  @MaxLength(160)
  email!: string;

  @ApiProperty({
    example: 'ClaveSegura123',
    minLength: 8,
    description: 'Máximo 72 bytes UTF-8 por el límite de bcrypt.',
  })
  @IsString()
  @MinLength(8)
  @Validate(MaxBcryptPasswordBytesConstraint)
  password!: string;
}
