import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { Request } from 'express';
import type { AuthenticatedUser } from '../auth/authenticated-user.js';
import { User } from '../auth/entities/user.entity.js';
import { ListAuditsDto } from './dto/list-audits.dto.js';
import { AuditLog } from './entities/audit-log.entity.js';

type AuditedRequest = Request & { user?: AuthenticatedUser };

@Injectable()
export class AuditsService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly repository: Repository<AuditLog>,
  ) {}

  async recordSuccessfulChange(
    request: AuditedRequest,
    statusCode: number,
    result: unknown,
  ): Promise<void> {
    const actor = request.user;
    const routeResource = request.baseUrl.replace(/^\/+/, '').split('/')[0];
    const resource =
      routeResource || request.path.split('/').filter(Boolean)[0] || 'unknown';
    const resultId = this.extractId(result);
    const resourceId = request.params.id ?? resultId;

    const entry = this.repository.create({
      actor: actor ? ({ id: actor.sub } as User) : null,
      actorEmail: actor?.email ?? null,
      httpMethod: request.method,
      resource,
      resourceId: resourceId == null ? null : String(resourceId),
      path: request.path,
      statusCode,
    });

    await this.repository.save(entry);
  }

  async findAll(query: ListAuditsDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 25;
    const [items, total] = await this.repository.findAndCount({
      relations: { actor: true },
      order: { createdAt: 'DESC', id: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      items: items.map((item) => ({
        id: item.id,
        actor: item.actor
          ? { id: item.actor.id, email: item.actorEmail }
          : item.actorEmail
            ? { id: null, email: item.actorEmail }
            : null,
        httpMethod: item.httpMethod,
        resource: item.resource,
        resourceId: item.resourceId,
        path: item.path,
        statusCode: item.statusCode,
        createdAt: item.createdAt,
      })),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    };
  }

  private extractId(result: unknown): string | number | null {
    if (typeof result !== 'object' || result === null) return null;
    const object = result as { id?: unknown; data?: unknown };
    if (typeof object.id === 'string' || typeof object.id === 'number') {
      return object.id;
    }
    if (typeof object.data === 'object' && object.data !== null) {
      const dataId = (object.data as { id?: unknown }).id;
      if (typeof dataId === 'string' || typeof dataId === 'number')
        return dataId;
    }
    return null;
  }
}
