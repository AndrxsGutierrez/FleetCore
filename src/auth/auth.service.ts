import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { QueryFailedError } from 'typeorm';
import {
  Mechanic,
  MechanicStatus,
} from '../mechanics/entities/mechanic.entity.js';
import { UserDao } from './dao/user.dao.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { RegisterDto } from './dto/register.dto.js';
import { User, UserRole } from './entities/user.entity.js';

export interface PublicUser {
  id: number;
  email: string;
  role: UserRole;
  mechanicId: number | null;
}

export interface AuthSession {
  accessToken: string;
  tokenType: 'Bearer';
  user: PublicUser;
}

const BCRYPT_ROUNDS = 12;

@Injectable()
export class AuthService {
  constructor(
    private readonly userDao: UserDao,
    private readonly jwtService: JwtService,
  ) {}

  async createUserByAdmin(dto: CreateUserDto): Promise<PublicUser> {
    let mechanic: Mechanic | undefined;
    if (dto.role === UserRole.TECHNICIAN && dto.mechanicId === undefined) {
      throw new BadRequestException(
        'mechanicId es obligatorio para usuarios TECHNICIAN.',
      );
    }

    if (dto.mechanicId !== undefined) {
      if (dto.role !== UserRole.TECHNICIAN) {
        throw new BadRequestException(
          'Solo un usuario TECHNICIAN puede vincularse a un mecánico.',
        );
      }
      const foundMechanic = await this.userDao.findMechanicById(dto.mechanicId);
      if (!foundMechanic) {
        throw new NotFoundException(
          `No existe un mecánico con identificador ${dto.mechanicId}.`,
        );
      }
      if (foundMechanic.status !== MechanicStatus.ACTIVE) {
        throw new ConflictException(
          'No se puede vincular un técnico a un mecánico inactivo.',
        );
      }
      if (await this.userDao.findUserByMechanicId(foundMechanic.id)) {
        throw new ConflictException(
          'Este mecánico ya está vinculado a otra cuenta.',
        );
      }
      mechanic = foundMechanic;
    }

    const user = await this.createUser(dto, dto.role, mechanic);
    return this.toPublicUser(user);
  }

  async login(email: string, password: string): Promise<AuthSession> {
    const normalizedEmail = email.trim().toLowerCase();
    const user = await this.userDao.findByEmail(normalizedEmail, true);
    if (!user)
      throw new UnauthorizedException('Correo o contraseña incorrectos.');

    let passwordMatches = false;
    try {
      passwordMatches = await bcrypt.compare(password, user.passwordHash);
    } catch {
      passwordMatches = false;
    }
    if (!passwordMatches) {
      throw new UnauthorizedException('Correo o contraseña incorrectos.');
    }
    return this.createSession(user);
  }

  private async createUser(
    credentials: RegisterDto,
    role: UserRole,
    mechanic?: Mechanic,
  ): Promise<User> {
    const email = credentials.email.trim().toLowerCase();
    if (await this.userDao.findByEmail(email)) {
      throw new ConflictException(
        `Ya existe un usuario con el correo ${email}.`,
      );
    }

    const passwordHash = await bcrypt.hash(credentials.password, BCRYPT_ROUNDS);
    const user = this.userDao.create({ email, passwordHash, role, mechanic });
    try {
      return await this.userDao.save(user);
    } catch (error) {
      if (error instanceof QueryFailedError) {
        const driverError = error.driverError as {
          code?: string;
          detail?: string;
        };
        if (driverError.code === '23505') {
          if (driverError.detail?.includes('(mechanic_id)')) {
            throw new ConflictException(
              'Este mecánico ya está vinculado a otra cuenta.',
            );
          }
          if (driverError.detail?.includes('(email)')) {
            throw new ConflictException(
              `Ya existe un usuario con el correo ${email}.`,
            );
          }
        }
      }
      throw error;
    }
  }

  private async createSession(user: User): Promise<AuthSession> {
    const accessToken = await this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
      role: user.role,
      mechanicId: user.mechanic?.id ?? null,
    });
    return {
      accessToken,
      tokenType: 'Bearer',
      user: this.toPublicUser(user),
    };
  }

  private toPublicUser(user: User): PublicUser {
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      mechanicId: user.mechanic?.id ?? null,
    };
  }
}
