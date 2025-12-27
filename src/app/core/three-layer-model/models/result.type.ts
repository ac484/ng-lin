/**
 * Result Pattern for Error Handling
 * 
 * Based on blueprint: docs/strategy-governance/blueprint/system/07-api-specifications.md
 * 
 * Provides type-safe error handling without throwing exceptions.
 */

export type Result<T, E = Error> = Success<T> | Failure<E>;

export interface Success<T> {
  success: true;
  value: T;
}

export interface Failure<E = Error> {
  success: false;
  error: E;
}

/**
 * Create a successful result
 */
export function Ok<T>(value: T): Success<T> {
  return { success: true, value };
}

/**
 * Create a failure result
 */
export function Err<E = Error>(error: E): Failure<E> {
  return { success: false, error };
}

/**
 * Type guard to check if result is success
 */
export function isSuccess<T, E>(result: Result<T, E>): result is Success<T> {
  return result.success === true;
}

/**
 * Type guard to check if result is failure
 */
export function isFailure<T, E>(result: Result<T, E>): result is Failure<E> {
  return result.success === false;
}

/**
 * Common error types
 */
export class PolicyViolationError extends Error {
  constructor(
    message: string,
    public readonly policy: string,
    public readonly context?: Record<string, any>
  ) {
    super(message);
    this.name = 'PolicyViolationError';
  }
}

export class ValidationError extends Error {
  constructor(
    message: string,
    public readonly field?: string,
    public readonly value?: any
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends Error {
  constructor(
    message: string,
    public readonly resourceType?: string,
    public readonly resourceId?: string
  ) {
    super(message);
    this.name = 'NotFoundError';
  }
}

export class PermissionDeniedError extends Error {
  constructor(
    message: string,
    public readonly requiredPermission?: string,
    public readonly userId?: string
  ) {
    super(message);
    this.name = 'PermissionDeniedError';
  }
}
