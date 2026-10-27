import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module.js';
import { AuditInterceptor } from './audit.interceptor.js';
import { AuditsController } from './audits.controller.js';
import { AuditsService } from './audits.service.js';
import { AuditLog } from './entities/audit-log.entity.js';

@Module({
  imports: [AuthModule, TypeOrmModule.forFeature([AuditLog])],
  controllers: [AuditsController],
  providers: [AuditsService, AuditInterceptor],
  exports: [AuditInterceptor],
})
export class AuditsModule {}
