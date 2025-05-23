import { ConsoleLogger, Injectable, Scope } from '@nestjs/common';

@Injectable({ scope: Scope.TRANSIENT })
export class CustomLogger extends ConsoleLogger {
  declare protected context: string;

  private readonly colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    gray: '\x1b[90m',
    white: '\x1b[37m',
    purple: '\x1b[35m',
    nest_red: '\x1b[38;5;203m',
  };

  setContext(context: string) {
    this.context = context;
  }

  protected formatMessage(
    message: any,
    logLevel: string,
    context?: string,
    functionCalled?: string,
  ) {
    const timestamp = new Date().toISOString();
    const coloredLevel = this.colorizeLevel(logLevel);
    const coloredContext = context
      ? `${this.colors.green}[${context}]${this.colors.reset}`
      : '';
    const coloredFunctionCalled = functionCalled
      ? `${this.colors.purple}[${functionCalled}]${this.colors.reset}`
      : '';
    const pidMessage = `${this.colors.gray}[PID ${process.pid}]${this.colors.reset}`;

    const formattedMessage = `${this.colors.gray}${timestamp}${this.colors.reset} | ${coloredLevel}${coloredFunctionCalled}${pidMessage}: ${coloredContext} ${this.colors.nest_red}${message}${this.colors.reset}`;

    return formattedMessage;
  }

  private colorizeLevel(level: string): string {
    switch (level) {
      case 'LOG':
        return `${this.colors.green}[${level}]${this.colors.reset}`;
      case 'ERROR':
        return `${this.colors.red}[${level}]${this.colors.reset}`;
      case 'WARN':
        return `${this.colors.yellow}[${level}]${this.colors.reset}`;
      case 'DEBUG':
        return `${this.colors.blue}[${level}]${this.colors.reset}`;
      case 'VERBOSE':
        return `${this.colors.magenta}[${level}]${this.colors.reset}`;
      default:
        return `${this.colors.white}[${level}]${this.colors.reset}`;
    }
  }

  log(message: any, context?: string) {
    const formattedMessage = this.formatMessage(message, 'LOG', context);
    console.log(formattedMessage);
  }

  error(message: any, functionCalled?: string, context?: string) {
    const formattedMessage = this.formatMessage(
      message,
      'ERROR',
      context,
      functionCalled,
    );
    console.error(formattedMessage);
  }

  warn(message: any, functionCalled?: string, context?: string) {
    const formattedMessage = this.formatMessage(
      message,
      'WARN',
      context,
      functionCalled,
    );
    console.warn(formattedMessage);
  }

  debug(message: any, functionCalled?: string, context?: string) {
    const formattedMessage = this.formatMessage(
      message,
      'DEBUG',
      context,
      functionCalled,
    );
    console.debug(formattedMessage);
  }

  verbose(message: any, functionCalled?: string, context?: string) {
    const formattedMessage = this.formatMessage(
      message,
      'VERBOSE',
      context,
      functionCalled,
    );
    console.debug(formattedMessage);
  }
}
