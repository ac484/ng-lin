import { Injectable } from '@angular/core';

export interface PerformanceTrace {
  readonly name: string;
  readonly durationMs: number;
  readonly startedAt: number;
  readonly endedAt: number;
  readonly attributes?: Record<string, unknown>;
}

/**
 * Minimal performance timer with trace labels.
 */
@Injectable({ providedIn: 'root' })
export class PerformanceMonitoringService {
  private readonly timers = new Map<string, number>();

  start(name: string): void {
    this.timers.set(name, performance.now());
  }

  end(name: string, attributes?: Record<string, unknown>): PerformanceTrace | null {
    const start = this.timers.get(name);
    if (start === undefined) {
      return null;
    }

    const endedAt = performance.now();
    const trace: PerformanceTrace = {
      name,
      durationMs: endedAt - start,
      startedAt: start,
      endedAt,
      attributes
    };

    this.timers.delete(name);
    // eslint-disable-next-line no-console
    console.info(`[PERF] ${name}`, trace);
    return trace;
  }
}
