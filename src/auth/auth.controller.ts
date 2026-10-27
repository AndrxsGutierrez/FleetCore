import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { AuthenticatedUser } from './authenticated-user.js';
import { AuthService } from './auth.service.js';
import { CurrentUser } from './decorators/current-user.decorator.js';
import { Public } from './decorators/public.decorator.js';
import { Roles } from './decorators/roles.decorator.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { RegisterDto } from './dto/register.dto.js';
import { UserRole } from './entities/user.entity.js';
import { JwtAuthGuard } from './guards/jwt-auth.guard.js';
import { RolesGuard } from './guards/roles.guard.js';

@ApiTags('Autenticación')
@UseGuards(JwtAuthGuard)
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Registrar una cuenta; solo ADMIN' })
  @ApiCreatedResponse({ description: 'Cuenta creada por un administrador.' })
  @ApiConflictResponse({ description: 'Ya existe una cuenta con ese correo.' })
  register(@Body() dto: CreateUserDto) {
    return this.authService.createUserByAdmin(dto);
  }

  @Post('login')
  @Public()
  @ApiOperation({ summary: 'Iniciar sesión con correo y contraseña' })
  @ApiOkResponse({ description: 'Sesión iniciada y token JWT emitido.' })
  @ApiUnauthorizedResponse({ description: 'Credenciales incorrectas.' })
  login(@Body() dto: RegisterDto) {
    return this.authService.login(dto.email, dto.password);
  }

  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Consultar la identidad del usuario autenticado' })
  @ApiOkResponse({ description: 'Usuario del token actual.' })
  @ApiUnauthorizedResponse({
    description: 'Token inválido, expirado o ausente.',
  })
  me(@CurrentUser() user: AuthenticatedUser) {
    return {
      id: user.sub,
      email: user.email,
      role: user.role,
      mechanicId: user.mechanicId,
    };
  }

}
