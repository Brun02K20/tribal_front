import { LoggerService } from '@nestjs/common';
import path from 'path';
import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

const logDir = process.env.LOG_DIR || path.join(process.cwd(), 'logs');

const baseFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json(),
);

export const winstonLogger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: baseFormat,
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp(),
        winston.format.printf(({ timestamp, level, message, context, stack }) => {
          const contextText = context ? ` [${context}]` : '';
          return `${timestamp} ${level}${contextText}: ${stack || message}`;
        }),
      ),
    }),
    new DailyRotateFile({
      dirname: logDir,
      filename: 'backend-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '30d',
      zippedArchive: true,
    }),
    new DailyRotateFile({
      dirname: logDir,
      filename: 'backend-error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      maxSize: '20m',
      maxFiles: '60d',
      zippedArchive: true,
    }),
  ],
});

export class WinstonNestLogger implements LoggerService {
  log(message: unknown, context?: string): void {
    winstonLogger.info(this.toMessage(message), { context });
  }

  error(message: unknown, trace?: string, context?: string): void {
    winstonLogger.error(this.toMessage(message), { context, stack: trace });
  }

  warn(message: unknown, context?: string): void {
    winstonLogger.warn(this.toMessage(message), { context });
  }

  debug(message: unknown, context?: string): void {
    winstonLogger.debug(this.toMessage(message), { context });
  }

  verbose(message: unknown, context?: string): void {
    winstonLogger.verbose(this.toMessage(message), { context });
  }

  private toMessage(message: unknown): string {
    return typeof message === 'string' ? message : JSON.stringify(message);
  }
}
