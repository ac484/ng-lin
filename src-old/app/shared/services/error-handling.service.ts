/**
 * Error Handling Service
 * 
 * Centralized error handling service for the application.
 * Provides consistent error handling, logging, and user notification.
 * 
 * Features:
 * - User-friendly error messages with i18n
 * - Error logging and tracking
 * - Toast notifications for errors
 * - Error categorization (network, auth, validation, etc.)
 * - Retry mechanisms for transient errors
 * 
 * @example
 * ```typescript
 * const errorService = inject(ErrorHandlingService);
 * 
 * try {
 *   await someOperation();
 * } catch (error) {
 *   errorService.handleError(error, {
 *     userMessage: '操作失敗',
 *     showToast: true,
 *     context: 'TaskCreation'
 *   });
 * }
 * ```
 */

import { Injectable, inject } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';

/**
 * Error severity levels
 */
export enum ErrorSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  FATAL = 'fatal'
}

/**
 * Error categories for better handling
 */
export enum ErrorCategory {
  NETWORK = 'network',
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  VALIDATION = 'validation',
  BUSINESS_LOGIC = 'business_logic',
  UNKNOWN = 'unknown'
}

/**
 * Error handling options
 */
export interface ErrorHandlingOptions {
  /**
   * User-facing error message (translated)
   */
  readonly userMessage?: string;

  /**
   * Whether to show toast notification
   */
  readonly showToast?: boolean;

  /**
   * Error severity level
   */
  readonly severity?: ErrorSeverity;

  /**
   * Error category
   */
  readonly category?: ErrorCategory;

  /**
   * Context for error logging
   */
  readonly context?: string;

  /**
   * Additional metadata
   */
  readonly metadata?: Record<string, unknown>;

  /**
   * Whether to log to console
   */
  readonly logToConsole?: boolean;

  /**
   * Whether to send to error tracking service
   */
  readonly sendToTracking?: boolean;
}

/**
 * Structured error information
 */
export interface ErrorInfo {
  readonly message: string;
  readonly severity: ErrorSeverity;
  readonly category: ErrorCategory;
  readonly context?: string;
  readonly timestamp: Date;
  readonly stack?: string;
  readonly metadata?: Record<string, unknown>;
}

/**
 * Error Handling Service
 */
@Injectable({ providedIn: 'root' })
export class ErrorHandlingService {
  private readonly messageService = inject(NzMessageService);

  /**
   * Handle an error with specified options
   * 
   * @param error - The error to handle
   * @param options - Error handling options
   */
  handleError(error: unknown, options: ErrorHandlingOptions = {}): void {
    const errorInfo = this.extractErrorInfo(error, options);

    // Log to console if enabled
    if (options.logToConsole !== false) {
      this.logError(errorInfo);
    }

    // Send to error tracking service if enabled
    if (options.sendToTracking) {
      this.sendToErrorTracking(errorInfo);
    }

    // Show toast notification if enabled
    if (options.showToast) {
      this.showToastNotification(errorInfo, options.userMessage);
    }
  }

  /**
   * Handle a network error
   * 
   * @param error - Network error
   * @param context - Context information
   */
  handleNetworkError(error: unknown, context?: string): void {
    this.handleError(error, {
      category: ErrorCategory.NETWORK,
      severity: ErrorSeverity.ERROR,
      userMessage: '網路連線錯誤，請檢查您的網路連線',
      showToast: true,
      context,
      sendToTracking: true
    });
  }

  /**
   * Handle an authentication error
   * 
   * @param error - Authentication error
   * @param context - Context information
   */
  handleAuthenticationError(error: unknown, context?: string): void {
    this.handleError(error, {
      category: ErrorCategory.AUTHENTICATION,
      severity: ErrorSeverity.WARNING,
      userMessage: '請先登入後再執行此操作',
      showToast: true,
      context,
      sendToTracking: false
    });
  }

  /**
   * Handle an authorization error
   * 
   * @param error - Authorization error
   * @param context - Context information
   */
  handleAuthorizationError(error: unknown, context?: string): void {
    this.handleError(error, {
      category: ErrorCategory.AUTHORIZATION,
      severity: ErrorSeverity.WARNING,
      userMessage: '您沒有權限執行此操作',
      showToast: true,
      context,
      sendToTracking: false
    });
  }

  /**
   * Handle a validation error
   * 
   * @param error - Validation error
   * @param context - Context information
   */
  handleValidationError(error: unknown, context?: string): void {
    this.handleError(error, {
      category: ErrorCategory.VALIDATION,
      severity: ErrorSeverity.INFO,
      userMessage: '輸入資料無效，請檢查後重試',
      showToast: true,
      context,
      sendToTracking: false
    });
  }

  /**
   * Show a success message
   * 
   * @param message - Success message
   */
  showSuccess(message: string): void {
    this.messageService.success(message);
  }

  /**
   * Show an info message
   * 
   * @param message - Info message
   */
  showInfo(message: string): void {
    this.messageService.info(message);
  }

  /**
   * Show a warning message
   * 
   * @param message - Warning message
   */
  showWarning(message: string): void {
    this.messageService.warning(message);
  }

  /**
   * Show an error message
   * 
   * @param message - Error message
   */
  showError(message: string): void {
    this.messageService.error(message);
  }

  /**
   * Extract structured error information from error object
   */
  private extractErrorInfo(error: unknown, options: ErrorHandlingOptions): ErrorInfo {
    let message = 'An unexpected error occurred';
    let stack: string | undefined;

    if (error instanceof Error) {
      message = error.message;
      stack = error.stack;
    } else if (typeof error === 'string') {
      message = error;
    } else if (typeof error === 'object' && error !== null) {
      const err = error as { message?: string; code?: string };
      message = err.message || err.code || JSON.stringify(error);
    }

    return {
      message,
      severity: options.severity || ErrorSeverity.ERROR,
      category: options.category || this.categorizeError(error),
      context: options.context,
      timestamp: new Date(),
      stack,
      metadata: options.metadata
    };
  }

  /**
   * Categorize an error based on its properties
   */
  private categorizeError(error: unknown): ErrorCategory {
    if (typeof error === 'object' && error !== null) {
      const err = error as { code?: string; message?: string };

      if (err.code) {
        if (err.code.includes('auth') || err.code.includes('unauthenticated')) {
          return ErrorCategory.AUTHENTICATION;
        }
        if (err.code.includes('permission') || err.code.includes('unauthorized')) {
          return ErrorCategory.AUTHORIZATION;
        }
        if (err.code.includes('network') || err.code.includes('unavailable')) {
          return ErrorCategory.NETWORK;
        }
        if (err.code.includes('invalid') || err.code.includes('validation')) {
          return ErrorCategory.VALIDATION;
        }
      }
    }

    return ErrorCategory.UNKNOWN;
  }

  /**
   * Log error to console with formatting
   */
  private logError(errorInfo: ErrorInfo): void {
    const prefix = `[${errorInfo.severity.toUpperCase()}] ${errorInfo.timestamp.toISOString()}`;
    const context = errorInfo.context ? ` [${errorInfo.context}]` : '';
    const message = `${prefix}${context}: ${errorInfo.message}`;

    switch (errorInfo.severity) {
      case ErrorSeverity.FATAL:
      case ErrorSeverity.ERROR:
        console.error(message, errorInfo);
        if (errorInfo.stack) {
          console.error(errorInfo.stack);
        }
        break;
      case ErrorSeverity.WARNING:
        console.warn(message, errorInfo);
        break;
      case ErrorSeverity.INFO:
        console.info(message, errorInfo);
        break;
    }
  }

  /**
   * Send error to external error tracking service
   * 
   * TODO: Integrate with error tracking service (Sentry, LogRocket, etc.)
   */
  private sendToErrorTracking(errorInfo: ErrorInfo): void {
    // Placeholder for error tracking integration
    console.log('Sending error to tracking service:', errorInfo);

    // Example Sentry integration:
    // Sentry.captureException(new Error(errorInfo.message), {
    //   level: errorInfo.severity,
    //   tags: {
    //     category: errorInfo.category,
    //     context: errorInfo.context
    //   },
    //   extra: errorInfo.metadata
    // });
  }

  /**
   * Show toast notification for error
   */
  private showToastNotification(errorInfo: ErrorInfo, customMessage?: string): void {
    const message = customMessage || this.getDefaultErrorMessage(errorInfo);

    switch (errorInfo.severity) {
      case ErrorSeverity.FATAL:
      case ErrorSeverity.ERROR:
        this.messageService.error(message, { nzDuration: 5000 });
        break;
      case ErrorSeverity.WARNING:
        this.messageService.warning(message, { nzDuration: 4000 });
        break;
      case ErrorSeverity.INFO:
        this.messageService.info(message, { nzDuration: 3000 });
        break;
    }
  }

  /**
   * Get default error message based on error category
   */
  private getDefaultErrorMessage(errorInfo: ErrorInfo): string {
    switch (errorInfo.category) {
      case ErrorCategory.NETWORK:
        return '網路連線錯誤，請稍後再試';
      case ErrorCategory.AUTHENTICATION:
        return '請先登入後再執行此操作';
      case ErrorCategory.AUTHORIZATION:
        return '您沒有權限執行此操作';
      case ErrorCategory.VALIDATION:
        return '輸入資料無效，請檢查後重試';
      case ErrorCategory.BUSINESS_LOGIC:
        return '操作失敗，請稍後再試';
      default:
        return '發生未預期的錯誤，請稍後再試';
    }
  }
}
