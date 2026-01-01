import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class NamespaceService {
  /**
   * Compose a namespace path (e.g., @username or @org/team).
   */
  compose(parts: string[]): string {
    return `@${parts.filter(Boolean).join('/')}`;
  }

  /**
   * Parse a namespace path into segments.
   */
  parse(namespacePath: string): string[] {
    return namespacePath.replace(/^@/, '').split('/').filter(Boolean);
  }
}
