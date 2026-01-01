/**
 * IDGenerator - Unique ID generation utilities
 * 
 * Generates unique identifiers for events, aggregates, and entities.
 */

/**
 * Generate UUID v4
 */
export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Generate sortable ID with timestamp prefix
 */
export function generateSortableId(prefix?: string): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 7);
  const id = `${timestamp}-${random}`;
  return prefix ? `${prefix}-${id}` : id;
}

/**
 * Generate aggregate ID
 */
export function generateAggregateId(type: string): string {
  return generateSortableId(type.toLowerCase());
}

/**
 * Generate event ID
 */
export function generateEventId(): string {
  return generateUUID();
}

/**
 * Parse sortable ID to extract timestamp
 */
export function parseTimestamp(sortableId: string): number | null {
  try {
    const parts = sortableId.split('-');
    const timestampPart = parts[parts.length - 2]; // Handle prefixed IDs
    return parseInt(timestampPart, 36);
  } catch {
    return null;
  }
}

/**
 * Generate correlation ID for tracing
 */
export function generateCorrelationId(): string {
  return `cor-${generateSortableId()}`;
}

/**
 * Generate process ID for sagas
 */
export function generateProcessId(): string {
  return `proc-${generateSortableId()}`;
}
