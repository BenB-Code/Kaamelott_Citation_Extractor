import { stdout } from 'process';
import { LogLevel } from '../models/log-level.type';

export class Logger {
  private timestamp(): string {
    return new Date().toISOString();
  }

  private buildLine(level: LogLevel, msg: string, context?: string): string {
    const ctx = context ? ` [${context}]` : '';
    return `${this.timestamp()} [${level}]${ctx} ${msg}`;
  }

  private write(line: string, overwrite: boolean): void {
    if (overwrite && stdout.isTTY) {
      stdout.clearLine(0);
      stdout.cursorTo(0);
      stdout.write(line);
    } else {
      stdout.write('\n' + line);
    }
  }

  stringifyText(message: unknown): string {
    return typeof message === 'string' ? message : JSON.stringify(message);
  }

  info(message: unknown, context?: string, overwrite = false): void {
    this.write(this.buildLine('INFO', this.stringifyText(message), context), overwrite);
  }

  warn(message: unknown, context?: string, overwrite = false): void {
    this.write(this.buildLine('WARN', this.stringifyText(message), context), overwrite);
  }

  error(message: unknown, context?: string, overwrite = false): void {
    const text = message instanceof Error ? message.stack || message.message : JSON.stringify(message);
    this.write(this.buildLine('ERROR', text, context), overwrite);
  }
}

export const logger = new Logger();
