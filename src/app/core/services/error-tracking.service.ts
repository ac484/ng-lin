import { Injectable, inject } from '@angular/core';
import { LoggerService } from './logger/logger.service';

export interface ErrorTrackingContext {
  scope?: 'guard' | 'interceptor' | 'handler' | 'service';
  requestId?: string;
  blueprintId?: string;
  tenantId?: string;
  userId?: string;
  tags?: string[];
  [key: string]: unknown;
}

/**
 * Minimal error tracking stub.
 * Centralizes capture points so future providers (e.g., Sentry) can plug in without touching call sites.
 */
@Injectable({ providedIn: 'root' })
export class ErrorTrackingService {
  private readonly logger = inject(LoggerService);

  captureError(error: unknown, context?: ErrorTrackingContext): void {
    this.logger.error('Captured error', error, context);
  }

  captureException(error: Error, context?: ErrorTrackingContext): void {
    this.captureError(error, {
      ...context,
      name: error.name,
      message: error.message,
      stack: error.stack
    });
  }
}
