import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import type { Request, Response } from 'express';
import { winstonLogger } from 'src/utils/logger/winston-logger';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const isHttpException = exception instanceof HttpException;
    const status = isHttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    const fallbackMessage = 'Ocurrió un error inesperado';
    let message: string | string[] = fallbackMessage;
    let errorLabel = isHttpException ? 'HttpException' : 'InternalServerError';

    if (isHttpException) {
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object' && exceptionResponse) {
        const payload = exceptionResponse as {
          message?: string | string[];
          error?: string;
        };

        if (payload.message) {
          message = payload.message;
        } else {
          message = exception.message || fallbackMessage;
        }

        if (payload.error) {
          errorLabel = payload.error;
        }
      } else {
        message = exception.message || fallbackMessage;
      }
    } else {
      const normalized = exception instanceof Error
        ? exception
        : new Error(typeof exception === 'string' ? exception : JSON.stringify(exception));
      winstonLogger.error('unhandled_http_exception', {
        method: request.method,
        path: request.originalUrl,
        errorName: normalized.name,
        errorMessage: normalized.message,
        stack: normalized.stack,
      });
    }

    response.status(status).json({
      message,
      error: errorLabel,
      status,
    });
  }
}
