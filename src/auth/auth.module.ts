import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Mechanic } from '../mechanics/entities/mechanic.entity.js';
import { UserDao } from './dao/user.dao.js';
import { User } from './entities/user.entity.js';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { ApiKeyGuard } from './guards/api-key.guard.js';
import { JwtAuthGuard } from './guards/jwt-auth.guard.js';
import { RolesGuard } from './guards/roles.guard.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Mechanic]),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const configuredSecret = configService.get<string>('JWT_SECRET');
        if (
          !configuredSecret &&
          configService.get<string>('NODE_ENV') === 'production'
        ) {
          throw new Error('JWT_SECRET debe estar configurado en producción.');
        }
        return {
          secret:
            configuredSecret ??
            'fleetcore-local-secret-change-before-production',
          signOptions: { expiresIn: 3600 },
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, UserDao, ApiKeyGuard, JwtAuthGuard, RolesGuard],
  // Export JwtModule too so modules using JwtAuthGuard can resolve JwtService.
  exports: [JwtModule, ApiKeyGuard, JwtAuthGuard, RolesGuard],
})
export class AuthModule {}
