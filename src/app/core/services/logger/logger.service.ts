import { Injectable, inject } from '@angular/core';
import { AuthFacade } from '../../auth';
import { TenantContextService } from '../tenant/tenant-context.service';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogContext {
  requestId?: string;
  blueprintId?: string;
  tenantId?: string;
  userId?: string;
  tags?: string[];
  [key: string]: unknown;
}

export interface LogEntry {
  readonly level: LogLevel;
  readonly message: string;
  readonly timestamp: string;
  readonly context?: LogContext;
  readonly payload?: unknown;
}

/**
 * Minimal structured logger for core services.
 * Enriches log lines with auth/tenant context and preserves a single injection surface.
 */
@Injectable({ providedIn: 'root' })
export class LoggerService {
  private readonly authFacade = inject(AuthFacade);
  private readonly tenantContext = inject(TenantContextService);

  debug(message: string, payload?: unknown, context?: LogContext): void {
    this.log('debug', message, payload, context);
  }

  info(message: string, payload?: unknown, context?: LogContext): void {
    this.log('info', message, payload, context);
  }

  warn(message: string, payload?: unknown, context?: LogContext): void {
    this.log('warn', message, payload, context);
  }

  error(message: string, payload?: unknown, context?: LogContext): void {
    this.log('error', message, payload, context);
  }

  private log(level: LogLevel, message: string, payload?: unknown, context?: LogContext): void {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context: this.enrichContext(context),
      payload
    };

    // Minimal structured output; can be redirected to remote sink later.
    // eslint-disable-next-line no-console
    console[level](`[${level.toUpperCase()}] ${message}`, entry);
  }

  private enrichContext(context?: LogContext): LogContext {
    const authUserId = this.authFacade.getCurrentUserId();
    const tenantId = this.tenantContext.getTenantId();
    return {
      userId: authUserId ?? context?.userId,
      tenantId: tenantId ?? context?.tenantId,
      blueprintId: context?.blueprintId,
      requestId: context?.requestId,
      tags: context?.tags,
      ...context
    };
  }
}
