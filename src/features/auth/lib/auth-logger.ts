/**
 * Centralized authentication logger
 * Provides consistent logging across auth features
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  userId?: string;
  email?: string;
  provider?: string;
  action?: string;
  [key: string]: unknown;
}

class AuthLogger {
  private static formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` | ${JSON.stringify(context)}` : '';
    return `[${timestamp}] [AUTH-${level.toUpperCase()}] ${message}${contextStr}`;
  }

  static debug(message: string, context?: LogContext): void {
    if (process.env.NODE_ENV === 'development') {
      console.debug(this.formatMessage('debug', message, context));
    }
  }

  static info(message: string, context?: LogContext): void {
    console.info(this.formatMessage('info', message, context));
  }

  static warn(message: string, context?: LogContext): void {
    console.warn(this.formatMessage('warn', message, context));
  }

  static error(message: string, error?: unknown, context?: LogContext): void {
    const errorDetails = error instanceof Error ? error.message : String(error);
    console.error(this.formatMessage('error', `${message}: ${errorDetails}`, context));
  }
}

export { AuthLogger };
