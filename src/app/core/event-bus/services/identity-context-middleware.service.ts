import { Injectable, inject } from '@angular/core';
import { IdentityContextService } from '../../services/identity-context.service';
import { DomainEvent } from '../models/base-event';

@Injectable({ providedIn: 'root' })
export class IdentityContextMiddleware {
  private readonly identityContext = inject(IdentityContextService);

  enrich<T extends DomainEvent>(event: T): T {
    const context = this.identityContext.getContext();
    const metadata = event.metadata ?? {
      version: '1.0',
      source: 'unknown'
    };

    const enrichedMetadata = {
      ...metadata,
      correlationId: metadata.correlationId ?? context.correlationId,
      actorId: metadata.actorId ?? context.userId ?? null,
      tenantId: metadata.tenantId ?? context.tenantId ?? null,
      organizationId: metadata.organizationId ?? context.organizationId ?? null,
      repositoryId: metadata.repositoryId ?? context.repositoryId ?? null,
      teamId: metadata.teamId ?? context.teamId ?? null,
      roles: metadata.roles ?? context.roles,
      permissions: metadata.permissions ?? context.permissions,
      scopes: metadata.scopes ?? context.scopes,
      github: metadata.github ?? context.github,
      context:
        metadata.context || context.extra
          ? {
              ...(context.extra ?? {}),
              ...(metadata.context ?? {})
            }
          : undefined
    };

    (event as any).metadata = enrichedMetadata;
    return event;
  }
}
